import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisModel, RelatorioCirurgicoData, AnaliseSegundaCall, RelatorioSegundaCallData } from "../types";
import * as pdfjsLib from 'pdfjs-dist';

// Configuração do worker do PDF.js
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

/**
 * Extrai o conteúdo de texto de um arquivo PDF.
 * @param file O arquivo PDF.
 * @returns Uma promessa que resolve com o texto extraído.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
    fullText += pageText + '\n\n';
  }
  return fullText;
}

// Inicialização lazy do cliente Gemini para evitar erro se a API key não estiver configurada
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
    if (!ai) {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY);
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY não configurada. Adicione VITE_GEMINI_API_KEY no arquivo .env.local');
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

const escapeDescription = `REGRA CRÍTICA: Quaisquer aspas duplas dentro desta string devem ser escapadas com uma barra invertida. Exemplo: 'Isto é uma \\"citação\\".'`;

const behavioralProfileSchema = {
    type: Type.OBJECT,
    properties: {
        identifiedProfile: { type: Type.STRING, description: 'Perfil comportamental do prospect (Dominante, Influente, Estável, Analítico ou Híbrido) identificado na transcrição.' },
        adaptationAnalysis: { type: Type.STRING, description: 'Análise de como o closer adaptou (ou não) sua abordagem ao perfil do prospect. Forneça exemplos da transcrição.' },
        personalizedRecommendations: { type: Type.STRING, description: 'Recomendações futuras sobre como se comunicar e quais gatilhos usar com este perfil.' },
        recommendedPhrases: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Uma lista de 3-5 frases exatas que o cliente mais gostaria de ouvir e que funcionariam bem com este perfil, baseadas na análise da transcrição.'
        }
    },
    description: 'Análise OBRIGATÓRIA do perfil comportamental do prospect e da adaptação do closer.'
};

const csFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: 'Um feedback conciso e direto para a equipe de Customer Success (CS) sobre a call, focando em pontos de atenção, próximos passos e como o CS pode agregar valor.' },
        referralOpportunities: { type: Type.STRING, description: 'Análise sobre o potencial de gerar indicações a partir deste cliente, incluindo o "porquê" e o momento ideal para pedir.' }
    },
    description: 'Feedback estratégico para a equipe de CS e análise de potencial de indicações.'
};

const referralsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: 'Nome completo da pessoa indicada.' },
            contact: { type: Type.STRING, description: 'Contato da pessoa indicada (telefone ou email), se mencionado.' },
            context: { type: Type.STRING, description: 'Breve contexto sobre por que essa pessoa foi indicada.' }
        }
    },
    description: 'Lista de indicações (referrals) explicitamente mencionadas e coletadas durante a call. Se nenhuma indicação for encontrada, retorne um array vazio.'
};

const stepsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.NUMBER },
            name: { type: Type.STRING, description: escapeDescription },
            score: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            status: { type: Type.STRING, enum: ['Excelente', 'Bom', 'Revisar'] },
            description: { type: Type.STRING, description: escapeDescription },
            specificAnalysis: { type: Type.STRING, description: escapeDescription },
            justification: { type: Type.STRING, description: escapeDescription },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING, description: escapeDescription } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING, description: escapeDescription } },
            benchmark: {
                type: Type.OBJECT,
                properties: {
                    average: { type: Type.NUMBER },
                    top: { type: Type.NUMBER },
                }
            }
        }
    }
};

const successfulCallSchema = {
    type: Type.OBJECT,
    properties: {
        closerName: { type: Type.STRING, description: escapeDescription },
        totalScore: { type: Type.NUMBER },
        totalMaxScore: { type: Type.NUMBER, description: "Sempre 250." },
        performanceSummary: { type: Type.STRING, description: escapeDescription },
        criticalMoment: { type: Type.STRING, description: escapeDescription },
        finalResult: { type: Type.STRING, description: escapeDescription },
        steps: stepsSchema,
        behavioralIndicators: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: escapeDescription },
                    description: { type: Type.STRING, description: escapeDescription },
                    score: { type: Type.NUMBER },
                    status: { type: Type.STRING, enum: ['Excelente', 'Bom', 'Consultivo', 'Revisar', 'Crítico', 'Péssimo'] }
                }
            }
        },
        behavioralProfile: behavioralProfileSchema,
        csFeedback: csFeedbackSchema,
        referrals: referralsSchema,
    }
};

const lostCallSchema = {
    type: Type.OBJECT,
    properties: {
        nomeCloser: { type: Type.STRING, description: `Extraia o nome do Closer do contexto ou transcrição. ${escapeDescription}` },
        totalScore: { type: Type.NUMBER, description: "Soma das notas das 25 etapas." },
        totalMaxScore: { type: Type.NUMBER, description: "Sempre 250." },

        pontuacaoPorEtapa: {
            type: Type.ARRAY,
            description: "Tabela completa com a pontuação de TODAS as 25 etapas. NUNCA omita uma etapa. Se a nota não puder ser determinada, use 0.",
            items: {
                type: Type.OBJECT,
                properties: {
                    etapa: { type: Type.NUMBER },
                    nome: { type: Type.STRING, description: escapeDescription },
                    nota: { type: Type.NUMBER, description: "Nota de 0 a 10." }
                }
            }
        },

        justificativaDetalhada: {
            type: Type.ARRAY,
            description: `[OBRIGATÓRIO] Para TODAS as 25 etapas que NÃO tiraram 10/10, fornecer uma justificativa detalhada. Se todas tiraram 10, retorne um array vazio. ${escapeDescription}`,
            items: {
                type: Type.OBJECT,
                properties: {
                    nomeEtapa: { type: Type.STRING, description: `Nome da etapa (ex: "ETAPA 1 - RAPPORT"). ${escapeDescription}` },
                    nota: { type: Type.STRING, description: `A nota no formato "X/10". ${escapeDescription}` },
                    porqueDaTecnica: { type: Type.STRING, description: `A intenção por trás da técnica da etapa. ${escapeDescription}` },
                    explicacaoEtapa: { type: Type.STRING, description: `Explicar porque essa etapa existe. ${escapeDescription}` },
                    oQueFezBem: { type: Type.STRING, description: `Aspectos positivos executados na etapa. ${escapeDescription}` },
                    pontosDeMelhoria: { type: Type.STRING, description: `O que faltou especificamente para alcançar a nota máxima (10/10). ${escapeDescription}` },
                    comoEstevaoFaria: { type: Type.STRING, description: `[Frase literal ou adaptada para o nicho extraída das CALLS PRÁTICAS reais]. ${escapeDescription}` },
                    cenarioSugerido: { type: Type.STRING, description: `[Baseado em calls, aulas, metodologia - arsenal completo para criar perguntas, cenários, abordagens]. ${escapeDescription}` }
                }
            }
        },

        perfilComportamental: {
            type: Type.OBJECT,
            description: "Relatório de perfil comportamental do cliente.",
            properties: {
                perfilDoCliente: { type: Type.ARRAY, items: { type: Type.STRING, enum: ['DOMINANTE', 'INFLUENTE', 'ESTÁVEL', 'ANALÍTICO'] } },
                medosIdentificados: { type: Type.ARRAY, items: { type: Type.STRING, description: escapeDescription } },
                frasesQueFuncionam: {
                    type: Type.OBJECT,
                    properties: {
                        dominante: { type: Type.STRING, description: escapeDescription },
                        influente: { type: Type.STRING, description: escapeDescription },
                        estavel: { type: Type.STRING, description: escapeDescription },
                        analitico: { type: Type.STRING, description: escapeDescription }
                    }
                },
                estrategiaDeAbordagem: {
                    type: Type.OBJECT,
                    properties: {
                        dominante: { type: Type.STRING, description: escapeDescription },
                        influente: { type: Type.STRING, description: escapeDescription },
                        estavel: { type: Type.STRING, description: escapeDescription },
                        analitico: { type: Type.STRING, description: escapeDescription }
                    }
                }
            }
        },

        acertosIdentificados: {
            type: Type.ARRAY,
            description: "Lista de 3 a 5 etapas que foram executadas corretamente.",
            items: {
                type: Type.OBJECT,
                properties: {
                    nomeEtapa: { type: Type.STRING, description: `Nome da etapa (ex: "ETAPA X - NOME DA ETAPA"). ${escapeDescription}` }
                }
            }
        },

        errosParaCorrecao: {
            type: Type.ARRAY,
            description: "Lista dos 3 a 5 erros mais importantes para correção.",
            items: {
                type: Type.OBJECT,
                properties: {
                    nomeEtapa: { type: Type.STRING, description: `Nome da etapa (ex: "ETAPA X - NOME DA ETAPA"). ${escapeDescription}` },
                    porqueFoiErro: { type: Type.STRING, description: `Explicação técnica do que deveria ter sido feito. ${escapeDescription}` },
                    oQueEleFalou: { type: Type.STRING, description: `[Frase exata da transcrição]. ${escapeDescription}` },
                    buscarNaBase: { type: Type.STRING, description: `[Situação similar onde Estevão converteu]. ${escapeDescription}` },
                    comoEstevaoFaria: { type: Type.STRING, description: `[Frase literal da transcrição real do Estevão]. ${escapeDescription}` },
                    porqueEhImportante: { type: Type.STRING, description: `[Impacto deste erro na venda]. ${escapeDescription}` }
                }
            }
        },

        indicadoresComportamentais: {
            type: Type.OBJECT,
            description: "Análise dos indicadores comportamentais do closer.",
            properties: {
                perguntasEmocionaisRacionais: { type: Type.STRING, description: `[Equilíbrio usado pelo closer]. ${escapeDescription}` },
                usoFrasesSuporte: { type: Type.STRING, description: `[Se reforçou confiança e acolhimento]. ${escapeDescription}` },
                controleCall: { type: Type.STRING, description: `[Quem perguntou mais: closer ou lead?]. ${escapeDescription}` },
                postura: { type: Type.STRING, description: `[Consultivo x Entrevistador]. ${escapeDescription}` }
            }
        },

        analiseFinal: {
            type: Type.OBJECT,
            description: "A análise final e diagnóstico 80/20.",
            properties: {
                diagnostico8020: {
                    type: Type.OBJECT,
                    properties: {
                        padraoDosErros: {
                            type: Type.OBJECT,
                            properties: {
                                excelente: { type: Type.STRING, description: `Número de etapas com nota 9-10/10. ${escapeDescription}` },
                                bom: { type: Type.STRING, description: `Número de etapas com nota 7-8/10. ${escapeDescription}` },
                                deficiente: { type: Type.STRING, description: `Número de etapas com nota 4-6/10. ${escapeDescription}` },
                                critico: { type: Type.STRING, description: `Número de etapas com nota 0-3/10. ${escapeDescription}` }
                            }
                        },
                        errosCriticos: {
                            type: Type.ARRAY,
                            description: "Os 3 erros mais críticos que causaram 80% da perda.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    etapa: { type: Type.STRING, description: `[ETAPA X]. ${escapeDescription}` },
                                    nota: { type: Type.STRING, description: `(Nota X/10). ${escapeDescription}` },
                                    oQueAconteceu: { type: Type.STRING, description: `[Erro específico]. ${escapeDescription}` },
                                    porqueFoiFatal: { type: Type.STRING, description: `[Como impactou o resto da call]. ${escapeDescription}` },
                                    timestamp: { type: Type.STRING, description: `[Momento exato]. ${escapeDescription}` },
                                    comoEstevaoFaria: { type: Type.STRING, description: `Analise o que o cliente falou e como o closer se portou. Descreva em detalhes, com uma frase literal e acionável, como Estevão teria agido para reverter a situação, extraindo o exemplo das CALLS PRÁTICAS reais. ${escapeDescription}` }
                                }
                            }
                        }
                    }
                },
                efeitoDomino: { type: Type.STRING, description: `A sequência de erros que levou à perda. Ex: "[ERRO 1] -> [CONSEQUÊNCIA] -> [ERRO 2] -> VENDA PERDIDA". ${escapeDescription}` },
                momentoExatoDaPerda: {
                    type: Type.OBJECT,
                    properties: {
                        timestamp: { type: Type.STRING, description: `[XX:XX:XX]. ${escapeDescription}` },
                        oQueAconteceu: { type: Type.STRING, description: `[O que aconteceu especificamente]. ${escapeDescription}` }
                    }
                },
                causaRaizDoErro: { type: Type.ARRAY, items: { type: Type.STRING, enum: ['Falha técnica', 'Nervosismo/insegurança', 'Falta de treinamento específico', 'Não leu sinais do prospect'] } },
                estrategiaDeCorrecao: {
                    type: Type.OBJECT,
                    properties: {
                        focoImediato: { type: Type.STRING, description: `[Etapa crítica para treinar]. ${escapeDescription}` },
                        proximaCall: { type: Type.STRING, description: `[O que fazer diferente]. ${escapeDescription}` },
                        scriptSalvaVidas: { type: Type.STRING, description: `"[Frase específica para usar]". ${escapeDescription}` }
                    }
                }
            }
        },
        behavioralProfile: behavioralProfileSchema,
        csFeedback: csFeedbackSchema,
        referrals: referralsSchema,
    }
};


const vendaRealizadaSchema = {
    type: Type.OBJECT,
    properties: {
        closerName: { type: Type.STRING, description: escapeDescription },
        totalScore: { type: Type.NUMBER, description: "Soma das notas de 25 etapas, cada uma valendo 10. Total máximo 250." },
        totalMaxScore: { type: Type.NUMBER, description: "Sempre 250." },
        pontosPositivos: {
            type: Type.OBJECT,
            properties: {
                descricao: { type: Type.STRING, description: escapeDescription },
                detalhes: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            etapa: { type: Type.STRING, description: escapeDescription },
                            oQueEleFalou: { type: Type.STRING, description: escapeDescription },
                            comoLeadReagiu: { type: Type.STRING, description: escapeDescription },
                            porqueFuncionou: { type: Type.STRING, description: escapeDescription },
                            referenciaEstevao: { type: Type.STRING, description: escapeDescription }
                        }
                    }
                }
            }
        },
        criticaConstrutiva: {
            type: Type.OBJECT,
            properties: {
                descricao: { type: Type.STRING, description: escapeDescription },
                detalhes: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            trechoCloser: { type: Type.STRING, description: escapeDescription },
                            respostaLead: { type: Type.STRING, description: escapeDescription },
                            erro: { type: Type.STRING, description: escapeDescription },
                            comoEstevaoFaria: { type: Type.STRING, description: escapeDescription },
                            impacto: { type: Type.STRING, description: escapeDescription }
                        }
                    }
                }
            }
        },
        elogioFinal: {
            type: Type.OBJECT,
            properties: {
                descricao: { type: Type.STRING, description: escapeDescription },
                detalhes: {
                    type: Type.OBJECT,
                    properties: {
                        reforcarPontos: { type: Type.STRING, description: escapeDescription },
                        mostrar8020: { type: Type.STRING, description: escapeDescription },
                        focosDeTreino: { type: Type.STRING, description: escapeDescription },
                        elogioPesado: { type: Type.STRING, description: escapeDescription }
                    }
                }
            }
        },
        steps: { ...stepsSchema, description: "Análise completa de todas as 25 etapas para garantir a consistência da pontuação total." },
        behavioralProfile: behavioralProfileSchema,
    }
};

const relatorioCirurgicoSchema = {
    type: Type.OBJECT,
    properties: {
        dadosBasicos: {
            type: Type.OBJECT,
            properties: {
                dataDaCall: { type: Type.STRING, description: `Data da chamada. ${escapeDescription}` },
                nomeDoCloser: { type: Type.STRING, description: `Nome do closer. ${escapeDescription}` },
                lead: { type: Type.STRING, description: `Nome do lead. ${escapeDescription}` },
                duracao: { type: Type.STRING, description: `Duração da chamada. ${escapeDescription}` },
                status: { type: Type.STRING, description: `Status do lead. ${escapeDescription}` }
            }
        },
        perfilComportamental: {
            type: Type.OBJECT,
            properties: {
                identificacaoPrimaria: { type: Type.STRING, enum: ['DOMINANTE', 'INFLUENTE', 'ESTÁVEL', 'ANALÍTICO', 'Híbrido'] },
                sinaisIdentificados: {
                    type: Type.OBJECT,
                    properties: {
                        linguagemUsada: {
                            type: Type.OBJECT,
                            properties: {
                                palavrasFrequentes: { type: Type.STRING, description: escapeDescription },
                                tomDeVoz: { type: Type.STRING, description: escapeDescription },
                                velocidadeDeResposta: { type: Type.STRING, description: escapeDescription }
                            }
                        },
                        comportamentosObservados: {
                            type: Type.OBJECT,
                            properties: {
                                respostasLongasCurtas: { type: Type.STRING, description: escapeDescription },
                                interrupcoes: { type: Type.STRING, description: escapeDescription },
                                perguntasFeitas: { type: Type.STRING, description: escapeDescription },
                                nivelDeEnergia: { type: Type.STRING, description: escapeDescription }
                            }
                        }
                    }
                },
                perfilHibrido: { type: Type.STRING, description: `Descrição do perfil híbrido. ${escapeDescription}` },
                frasesDeConexaoRecomendadas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Lista de frases específicas que gerarão conexão com o lead, baseado em seu perfil.' }
            }
        },
        focoEntregaveis: { type: Type.ARRAY, items: { type: Type.STRING, description: escapeDescription } },
        estrategiaPorPerfil: {
            type: Type.OBJECT,
            properties: {
                dominante: { type: Type.OBJECT, properties: { foqueEm: { type: Type.ARRAY, items: { type: Type.STRING } }, eviteEnfatizar: { type: Type.STRING } } },
                influente: { type: Type.OBJECT, properties: { foqueEm: { type: Type.ARRAY, items: { type: Type.STRING } }, eviteEnfatizar: { type: Type.STRING } } },
                estavel: { type: Type.OBJECT, properties: { foqueEm: { type: Type.ARRAY, items: { type: Type.STRING } }, eviteEnfatizar: { type: Type.STRING } } },
                analitico: { type: Type.OBJECT, properties: { foqueEm: { type: Type.ARRAY, items: { type: Type.STRING } }, eviteEnfatizar: { type: Type.STRING } } }
            }
        },
        diagnosticoSpin: {
            type: Type.OBJECT,
            properties: {
                situacaoAtual: { type: Type.OBJECT, properties: { faturamentoAtual: { type: Type.STRING }, estruturaClinica: { type: Type.STRING }, canaisCaptacao: { type: Type.STRING }, margemLucro: { type: Type.STRING } } },
                problemasIdentificados: { type: Type.OBJECT, properties: { dorPrincipal: { type: Type.STRING }, dorSecundaria: { type: Type.STRING }, dorTerciaria: { type: Type.STRING }, tempoComProblemas: { type: Type.STRING }, tentativasAnteriores: { type: Type.STRING } } },
                implicacaoEmocional: { type: Type.OBJECT, properties: { comoSeSente: { type: Type.STRING }, impactosVidaPessoal: { type: Type.STRING }, medosReais: { type: Type.STRING }, oQuePodeAcontecer: { type: Type.STRING } } },
                necessidadeSolucao: { type: Type.OBJECT, properties: { objetivoEspecifico: { type: Type.STRING }, prazoDesejado: { type: Type.STRING }, motivacao: { type: Type.STRING }, disposicao: { type: Type.STRING }, nivelPrioridade: { type: Type.STRING }, acreditaResolver90dias: { type: Type.BOOLEAN } } }
            }
        },
        narrativasPessoais: {
            type: Type.OBJECT,
            properties: {
                trajetoriaProfissional: { type: Type.OBJECT, properties: { comoChegouEstetica: { type: Type.STRING }, momentosMarcantes: { type: Type.STRING }, maiorFrustracao: { type: Type.STRING }, maiorConquista: { type: Type.STRING } } },
                contextoPessoal: { type: Type.OBJECT, properties: { familia: { type: Type.STRING }, sonhosAspiracoes: { type: Type.STRING }, estiloVidaAtual: { type: Type.STRING }, oQueMudaria: { type: Type.STRING } } }
            }
        },
        gatilhosEmocionais: {
            type: Type.OBJECT,
            properties: {
                motivacoesProfundas: { type: Type.OBJECT, properties: { oQueRealmenteQuer: { type: Type.STRING }, porQueFaturamento: { type: Type.STRING }, comoSeSentiria: { type: Type.STRING }, statusReconhecimento: { type: Type.STRING } } },
                medosDoresEmocionais: { type: Type.OBJECT, properties: { maiorMedoProfissional: { type: Type.STRING }, medoContinuarEstagnado: { type: Type.STRING }, impactoAutoestima: { type: Type.STRING }, comparacaoConcorrentes: { type: Type.STRING } } },
                palavrasGatilhoEspecificas: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        mapeamentoFinanceiro: {
            type: Type.OBJECT,
            properties: {
                situacaoAtualFinanceira: { type: Type.OBJECT, properties: { rendaLiquida: { type: Type.STRING }, reservaEmergencia: { type: Type.STRING }, investimentosAtuais: { type: Type.STRING } } },
                mentalidadeInvestimento: { type: Type.OBJECT, properties: { experienciasAnteriores: { type: Type.STRING }, maiorInvestimento: { type: Type.STRING }, comoEnxergaROI: { type: Type.STRING } } }
            }
        },
        objecoesAntecipadas: {
            type: Type.OBJECT,
            properties: {
                financeirasProvaveis: { type: Type.OBJECT, properties: { objecoes: { type: Type.ARRAY, items: { type: Type.STRING } }, estrategiaContorno: { type: Type.STRING } } },
                credibilidadeProvaveis: { type: Type.OBJECT, properties: { objecoes: { type: Type.ARRAY, items: { type: Type.STRING } }, estrategiaContorno: { type: Type.STRING } } }
            }
        },
        estrategiaFechamento: {
            type: Type.OBJECT,
            properties: {
                abordagemInicial: { type: Type.STRING },
                argumentosPrincipais: { type: Type.ARRAY, items: { type: Type.STRING } },
                casesDeSucessoEstrategicos: { type: Type.OBJECT, properties: { casePrincipal: { type: Type.STRING }, porQueCase: { type: Type.STRING }, conexaoSituacao: { type: Type.STRING } } },
                ancoragemValorEspecifica: { type: Type.OBJECT, properties: { calculoOportunidadePerdida: { type: Type.STRING }, roiPersonalizado: { type: Type.STRING } } },
                fechamentoPorPerfil: { type: Type.OBJECT, properties: { seDominante: { type: Type.STRING }, seInfluente: { type: Type.STRING }, seEstavel: { type: Type.STRING }, seAnalitico: { type: Type.STRING } } }
            }
        },
        planoSegundaCall: {
            type: Type.OBJECT,
            properties: {
                conexao: { type: Type.ARRAY, items: { type: Type.STRING } },
                apresentacaoDirecionada: { type: Type.ARRAY, items: { type: Type.STRING } },
                ancoragemPersonalizada: { type: Type.ARRAY, items: { type: Type.STRING } },
                fechamento: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        checklistPreCall: { type: Type.ARRAY, items: { type: Type.STRING } },
        lembreteFinal: { type: Type.STRING },
    }
};

const relatorioSegundaCallSchema = {
    type: Type.OBJECT,
    properties: {
        cliente: { type: Type.STRING },
        dataDaAnalise: { type: Type.STRING },
        ato1_briefing: {
            type: Type.OBJECT,
            properties: {
                resumoExecutivo: { type: Type.OBJECT, properties: { contexto: { type: Type.STRING }, doresDeclaradas: { type: Type.STRING }, impactoReal: { type: Type.STRING }, desejoCentral: { type: Type.STRING }, pontoDeMaiorInteresse: { type: Type.STRING }, realMotivoDaCompra: { type: Type.STRING } } },
                analisePsicologica: { type: Type.OBJECT, properties: { perfilComportamental: { type: Type.STRING }, comoSeComunicar: { type: Type.STRING } } },
                palavrasEFrasesDeConexao: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        ato2_planoDeAcao: {
            type: Type.OBJECT,
            properties: {
                etapas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { titulo: { type: Type.STRING }, objetivo: { type: Type.STRING }, referenciaParaEstudo: { type: Type.STRING }, script: { type: Type.STRING } } } }
            }
        },
        ato3_protocolosAvancados: {
            type: Type.OBJECT,
            properties: {
                planoDeContencaoDeObjecoes: { type: Type.OBJECT, properties: { objecaoAntecipada: { type: Type.STRING }, protocoloDeResposta: { type: Type.STRING } } },
                taticaPsicologicaRecomendada: { type: Type.OBJECT, properties: { armaSugerida: { type: Type.STRING }, gatilhoParaUso: { type: Type.STRING } } },
                referenciasDoArsenal: { type: Type.OBJECT, properties: { tecnicasDeFechamento: { type: Type.STRING }, estruturaEScripts: { type: Type.STRING }, psicologiaDaComunicacao: { type: Type.STRING }, validacaoDaQualidade: { type: Type.STRING } } }
            }
        },
    }
};

const baselineIndicacaoSchema = {
    type: Type.OBJECT,
    properties: {
        informacoesCliente: {
            type: Type.OBJECT,
            properties: {
                nomeCompleto: { type: Type.STRING },
                dataVenda: { type: Type.STRING },
                produtoServico: { type: Type.STRING },
                valorInvestimento: { type: Type.NUMBER },
                closerResponsavel: { type: Type.STRING }
            }
        },
        doresQuantificadas: {
            type: Type.OBJECT,
            properties: {
                principal: { type: Type.OBJECT, properties: { descricao: { type: Type.STRING }, nota: { type: Type.NUMBER } } },
                secundario: { type: Type.OBJECT, properties: { descricao: { type: Type.STRING }, nota: { type: Type.NUMBER } } },
                terciario: { type: Type.OBJECT, properties: { descricao: { type: Type.STRING }, nota: { type: Type.NUMBER } } },
                impactos: {
                    type: Type.OBJECT,
                    properties: {
                        trabalhoProdutividade: { type: Type.NUMBER },
                        relacionamentos: { type: Type.NUMBER },
                        saudeEnergia: { type: Type.NUMBER },
                        financeiro: { type: Type.NUMBER },
                        qualidadeDeVidaGeral: { type: Type.NUMBER }
                    }
                },
                frequencia: { type: Type.STRING, enum: ['Diário', 'Semanal', 'Mensal', 'Esporádico'] },
                tempoEnfrentando: { type: Type.STRING }
            }
        },
        situacaoAtual: {
            type: Type.OBJECT,
            properties: {
                faturamento: { type: Type.NUMBER },
                resultado: { type: Type.STRING },
                metricaPrincipal: { type: Type.STRING },
                outrasMetricas: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        expectativasDesejos: {
            type: Type.OBJECT,
            properties: {
                principal: { type: Type.STRING },
                listaDesejos: { type: Type.ARRAY, items: { type: Type.STRING } },
                metaNumericaDeclarada: {
                    type: Type.OBJECT,
                    properties: {
                        ondeQuerChegar: { type: Type.NUMBER },
                        emQuantoTempo: { type: Type.STRING },
                        resultadoEsperado: { type: Type.STRING }
                    }
                },
                transformacaoEsperada: { type: Type.STRING }
            }
        },
        contextoEmocional: {
            type: Type.OBJECT,
            properties: {
                sentimentoDominante: { type: Type.STRING },
                palavrasChave: { type: Type.ARRAY, items: { type: Type.STRING } },
                consequenciaSeNaoResolver: { type: Type.STRING }
            }
        },
        tentativasAnteriores: {
            type: Type.OBJECT,
            properties: {
                jaTentou: { type: Type.BOOLEAN },
                detalhes: {
                    type: Type.OBJECT,
                    properties: {
                        solucaoMetodo: { type: Type.STRING },
                        investimento: { type: Type.NUMBER },
                        tempo: { type: Type.STRING },
                        resultado: { type: Type.STRING },
                        porQueNaoFuncionou: { type: Type.STRING }
                    }
                },
                principalObjecaoAtual: { type: Type.STRING }
            }
        },
        promessaCompromisso: {
            type: Type.OBJECT,
            properties: {
                promessaEspecifica: { type: Type.STRING },
                agendamentoRetorno: {
                    type: Type.OBJECT,
                    properties: {
                        data: { type: Type.STRING },
                        frameUsado: { type: Type.STRING },
                        clienteAceitou: { type: Type.BOOLEAN },
                        lembreteProgramado: { type: Type.STRING }
                    }
                }
            }
        },
        perfilParaIndicacao: {
            type: Type.OBJECT,
            properties: {
                contextoProfissional: {
                    type: Type.OBJECT,
                    properties: {
                        profissao: { type: Type.STRING },
                        nicho: { type: Type.STRING },
                        tempoExperiencia: { type: Type.STRING },
                        comunidade: { type: Type.OBJECT, properties: { fazParte: { type: Type.BOOLEAN }, qual: { type: Type.STRING } } }
                    }
                },
                estiloRelacionamento: { type: Type.STRING, enum: ['Muito conectado', 'Seletivo', 'Influente no nicho', 'Discreto/reservado', 'Empreendedor ativo'] },
                tomadaDecisao: {
                    type: Type.OBJECT,
                    properties: {
                        comoDecide: { type: Type.STRING, enum: ['Sozinho', 'Com cônjuge', 'Com sócios', 'Com equipe/conselho'] },
                        nomesDecisores: { type: Type.STRING }
                    }
                },
                potencial: { type: Type.STRING, enum: ['Alto', 'Médio', 'Baixo'] }
            }
        },
        observacoesEstrategicas: {
            type: Type.OBJECT,
            properties: {
                insightsCloser: { type: Type.STRING },
                frasesMarcantes: { type: Type.ARRAY, items: { type: Type.STRING } },
                gatilhosEmocionais: { type: Type.ARRAY, items: { type: Type.STRING } },
                objecoesVencidas: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        }
    }
};

const analiseSegundaCallSchema = {
    type: Type.OBJECT,
    properties: {
        pontuacaoAderencia: { type: Type.NUMBER, description: 'Score de 0-100 representando o quão bem o closer seguiu o plano estratégico da primeira call.' },
        acertos: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Lista de pontos onde o closer seguiu o plano com sucesso.' },
        melhorias: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Lista de pontos onde o closer se desviou do plano ou poderia ter melhorado.' },
        feedbackGeral: { type: Type.STRING, description: 'Um resumo geral da performance na segunda call em relação ao plano.' }
    }
};

const getModelSchema = (model: AnalysisModel) => {
    switch (model.id) {
        case 'next-level': return successfulCallSchema;
        case 'call-perdida': return lostCallSchema;
        case 'venda-realizada': return vendaRealizadaSchema;
        case 'relatorio-cirurgico': return relatorioCirurgicoSchema;
        case 'relatorio-segunda-call': return relatorioSegundaCallSchema;
        case 'baseline-indicacao': return baselineIndicacaoSchema;
        case 'universal':
        default:
            return lostCallSchema;
    }
}

export async function generateAnalysis(
    fileContent: string,
    model: AnalysisModel,
    contextData: string
): Promise<any> {
    const schema = getModelSchema(model);
    const systemInstruction = `Você é um especialista em análise de vendas de alto ticket, treinado por Estevão Soares. Sua tarefa é analisar a transcrição de uma call de vendas e retornar um JSON estruturado.
REGRAS CRÍTICAS E INEGOCIÁVEIS:
1. Sua resposta DEVE SER ESTRITAMENTE um objeto JSON válido, sem nenhum texto, explicação ou markdown (\`\`\`json\`\`\`) ao redor dele.
2. Você DEVE seguir o \`responseSchema\` fornecido com precisão absoluta. Todos os campos obrigatórios devem ser preenchidos.
3. Se uma informação não for encontrada na transcrição, preencha o campo correspondente com "Não identificado", 0 para números, ou um array vazio para listas, mas NUNCA omita o campo.
4. Quaisquer aspas duplas dentro de uma string de descrição DEVEM ser escapadas com uma barra invertida (ex: "Isto é uma \\"citação\\".").
5. Seja rigoroso, técnico e forneça insights acionáveis, usando o CONTEXTO ADICIONAL para enriquecer a análise com a metodologia e exemplos específicos.`;
    
    const contents = `
        **CONTEXTO ADICIONAL (Base de Conhecimento):**
        ${contextData}

        **TRANSCRIÇÃO DA CALL PARA ANÁLISE:**
        ${fileContent}
    `;

    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });
        
        let jsonText = response.text.trim();
        // Sanitize the response to remove potential markdown fences
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7);
            if (jsonText.endsWith('```')) {
                jsonText = jsonText.substring(0, jsonText.length - 3);
            }
        }
        jsonText = jsonText.trim();
        
        return JSON.parse(jsonText);

    } catch (error) {
        if (error instanceof SyntaxError) {
             console.error("Falha ao analisar a resposta JSON da Gemini. Erro:", error, "Texto Recebido:", (error as any).source);
             throw new Error("A IA retornou uma resposta em formato inválido (JSON malformado).");
        }
        console.error("Erro na API Gemini:", error);
        throw new Error("Falha ao gerar análise com a API Gemini. Verifique o console para mais detalhes.");
    }
}

export async function generateSecondCallComparison(
    originalReport: RelatorioCirurgicoData,
    secondCallContent: string
): Promise<AnaliseSegundaCall> {
     const systemInstruction = `Você é um especialista em análise de vendas. Sua tarefa é comparar a transcrição de uma segunda call de vendas com o plano estratégico gerado a partir da primeira. Avalie a aderência do closer ao plano, identificando acertos e desvios. Retorne um JSON estruturado com sua análise.`;
     const contents = `
        **PLANO ESTRATÉGICO DA 1ª CALL (O QUE DEVERIA ACONTECER):**
        ${JSON.stringify(originalReport, null, 2)}

        **TRANSCRIÇÃO DA 2ª CALL (O QUE ACONTECEU):**
        ${secondCallContent}

        **SUA TAREFA:**
        Analise a transcrição da 2ª call e compare-a ESTRITAMENTE com o plano estratégico e dicas da 1ª call. O feedback deve focar 100% nesta comparação. Forneça uma pontuação de aderência de 0 a 100, liste os acertos (onde o plano foi seguido) e os pontos de melhoria (onde houve desvio do plano), e dê um feedback geral sobre essa aderência.
    `;

    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: analiseSegundaCallSchema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AnaliseSegundaCall;
    } catch (error) {
        console.error("Error generating second call comparison:", error);
        throw new Error("Falha ao comparar a segunda call com a API Gemini.");
    }
}
