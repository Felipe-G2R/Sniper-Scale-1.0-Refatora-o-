// Since we are loading this from a CDN script in index.html,
// we need to declare it to TypeScript to avoid errors.
declare const jspdf: any;

// FIX: Correctly import all necessary report and result types.
import type { SuccessfulCallReportData, LostCallReportData, VendaRealizadaReportData, AnalysisResult } from '../types';

const A4_WIDTH = 210;
const MARGIN = 15;
const MAX_WIDTH = A4_WIDTH - MARGIN * 2;
const FONT_SIZE_TITLE = 18;
const FONT_SIZE_HEADING = 14;
const FONT_SIZE_SUBHEADING = 12;
const FONT_SIZE_BODY = 10;
const LINE_HEIGHT = 1.5;

let y: number;
let doc: any;

/**
 * A unified render function that handles all text rendering.
 * It correctly calculates text height, manages page breaks, and updates the vertical position (y).
 * This prevents text blocks from overlapping.
 */
const renderBlock = (
    text: string | string[],
    options: {
        fontSize: number;
        fontStyle?: 'normal' | 'bold' | 'italic';
        align?: 'left' | 'center';
        spacingBefore?: number;
        spacingAfter?: number;
    }
) => {
    const {
        fontSize,
        fontStyle = 'normal',
        align = 'left',
        spacingBefore = 0,
        spacingAfter = 0
    } = options;

    // Apply spacing before the block
    y += spacingBefore;

    doc.setFontSize(fontSize);
    doc.setFont(undefined, fontStyle);

    const lines = Array.isArray(text)
        ? text.flatMap(line => doc.splitTextToSize(String(line), MAX_WIDTH))
        : doc.splitTextToSize(String(text), MAX_WIDTH);

    const dimensions = doc.getTextDimensions(lines, { fontSize, lineHeightFactor: LINE_HEIGHT });
    const heightNeeded = dimensions.h;

    // Check for page break before rendering
    if (y + heightNeeded > 297 - MARGIN) {
        doc.addPage();
        y = MARGIN;
    }

    const xPos = align === 'center' ? A4_WIDTH / 2 : MARGIN;
    doc.text(lines, xPos, y, { align, lineHeightFactor: LINE_HEIGHT });

    // Update y position after rendering
    y += heightNeeded + spacingAfter;
};


const addTitle = (text: string) => {
    renderBlock(text, {
        fontSize: FONT_SIZE_TITLE,
        fontStyle: 'bold',
        align: 'center',
        spacingAfter: 15,
    });
};

const addHeading = (text: string) => {
    renderBlock(text, {
        fontSize: FONT_SIZE_HEADING,
        fontStyle: 'bold',
        spacingAfter: 5,
    });
};

const addSubHeading = (text: string, options?: { bold?: boolean }) => {
    renderBlock(text, {
        fontSize: FONT_SIZE_SUBHEADING,
        fontStyle: options?.bold ? 'bold' : 'normal',
        spacingAfter: 3,
    });
};

const addText = (text: string | string[]) => {
    renderBlock(text, {
        fontSize: FONT_SIZE_BODY,
        fontStyle: 'normal',
        spacingAfter: 5,
    });
};


const addSectionBreak = () => {
    const heightNeeded = 15;
    if (y + heightNeeded > 297 - MARGIN) {
        doc.addPage();
        y = MARGIN;
    } else {
         y += 5; // spacing before line
    }
    
    doc.setDrawColor(100, 100, 100);
    doc.line(MARGIN, y, A4_WIDTH - MARGIN, y);
    y += 10; // spacing after line
};

const exportSuccessfulCallPDF = (data: SuccessfulCallReportData) => {
    addTitle(`Relatório de Análise - Venda Realizada`);
    addSubHeading(`Vendedor: ${data.closerName}`);
    addSubHeading(`Arquivo: ${data.fileName}`);
    addSubHeading(`Pontuação Total: ${data.totalScore}/${data.totalMaxScore}`, { bold: true });
    
    addSectionBreak();
    addHeading("Resumo da Performance");
    addSubHeading("Excelente Performance!", { bold: true });
    addText(data.performanceSummary);
    addSubHeading("Momento Crítico", { bold: true });
    addText(data.criticalMoment);
    addSubHeading("Resultado Final", { bold: true });
    addText(data.finalResult);

    addSectionBreak();
    addHeading("Análise das Etapas");
    data.steps.forEach(step => {
        addSubHeading(`Etapa ${step.id}: ${step.name} - Nota ${step.score}/${step.maxScore}`);
        addText(`Análise: ${step.specificAnalysis}`);
    });
};

// FIX: Refactored the 'exportLostCallPDF' function to use the new 'LostCallReportData' type structure, resolving multiple property access errors.
const exportLostCallPDF = (data: LostCallReportData) => {
    addTitle(`Relatório de Análise - Call Perdida`);
    addSubHeading(`Vendedor: ${data.nomeCloser}`);
    addSubHeading(`Arquivo: ${data.fileName}`);
    const percentage = data.totalMaxScore > 0 ? (data.totalScore / data.totalMaxScore) * 100 : 0;
    
    let classification = "Excelente";
    if (percentage < 40) classification = "Crítica";
    else if (percentage < 70) classification = "Deficiente";
    else if (percentage < 90) classification = "Boa";

    addSubHeading(`Performance: ${data.totalScore}/${data.totalMaxScore} (${percentage.toFixed(0)}% - ${classification})`, { bold: true });

    // Analise Final
    if (data.analiseFinal) {
        addSectionBreak();
        addHeading("Análise Final - Diagnóstico 80/20");
        if (data.analiseFinal.diagnostico8020) {
            addSubHeading("Padrão dos Erros", { bold: true });
            const padroes = data.analiseFinal.diagnostico8020.padraoDosErros;
            addText([
                `Excelente (9-10): ${padroes.excelente}`,
                `Bom (7-8): ${padroes.bom}`,
                `Deficiente (4-6): ${padroes.deficiente}`,
                `Crítico (0-3): ${padroes.critico}`
            ]);
            addSubHeading("Erros Críticos (80/20)", { bold: true });
            (data.analiseFinal.diagnostico8020.errosCriticos ?? []).forEach(erro => {
                addText([
                    `Etapa: ${erro.etapa} (${erro.nota})`,
                    `O que aconteceu: ${erro.oQueAconteceu}`,
                    `Por que foi fatal: ${erro.porqueFoiFatal}`,
                    `Timestamp: ${erro.timestamp}`
                ]);
            });
        }
        addSubHeading("Efeito Dominó da Perda", { bold: true });
        addText(data.analiseFinal.efeitoDomino);
        addSubHeading("Momento Exato da Perda", { bold: true });
        addText(`${data.analiseFinal.momentoExatoDaPerda?.timestamp} - ${data.analiseFinal.momentoExatoDaPerda?.oQueAconteceu}`);
        addSubHeading("Causa Raiz do Erro", { bold: true });
        addText((data.analiseFinal.causaRaizDoErro ?? []).join(', '));
    }
    
    // Estratégia de Correção
    if (data.analiseFinal?.estrategiaDeCorrecao) {
        addSectionBreak();
        addHeading("Estratégia de Correção");
        addSubHeading("Foco Imediato:", { bold: true });
        addText(data.analiseFinal.estrategiaDeCorrecao.focoImediato);
        addSubHeading("Próxima Call:", { bold: true });
        addText(data.analiseFinal.estrategiaDeCorrecao.proximaCall);
        addSubHeading("Script Salva-Vidas:", { bold: true });
        addText(`"${data.analiseFinal.estrategiaDeCorrecao.scriptSalvaVidas}"`);
    }

    // Perfil Comportamental
    if (data.perfilComportamental) {
        addSectionBreak();
        addHeading("Relatório - Perfil Comportamental");
        const profile = data.perfilComportamental.perfilDoCliente?.[0];
        addText(`Perfil Identificado: ${profile || 'N/A'}`);
        addSubHeading("Medos Identificados:", { bold: true });
        addText((data.perfilComportamental.medosIdentificados ?? []).map(m => `- ${m}`));

        if (profile) {
            const strategyKey = profile.toLowerCase() as keyof typeof data.perfilComportamental.estrategiaDeAbordagem;
            const strategyText = data.perfilComportamental.estrategiaDeAbordagem[strategyKey];
            if (strategyText) {
                 addSubHeading("Estratégia de Abordagem Recomendada:", { bold: true });
                 addText(strategyText);
            }
        }
    }

    // Indicadores Comportamentais
    if(data.indicadoresComportamentais) {
        addSectionBreak();
        addHeading("Indicadores Comportamentais");
        addText(`Perguntas Emocionais x Racionais: ${data.indicadoresComportamentais.perguntasEmocionaisRacionais}`);
        addText(`Uso de Frases de Suporte: ${data.indicadoresComportamentais.usoFrasesSuporte}`);
        addText(`Controle da Call: ${data.indicadoresComportamentais.controleCall}`);
        addText(`Postura: ${data.indicadoresComportamentais.postura}`);
    }
    
    // Pontuação por Etapa
    if (data.pontuacaoPorEtapa?.length) {
        addSectionBreak();
        addHeading("Pontuação por Etapa");
        const stepsText = (data.pontuacaoPorEtapa ?? []).map(step => `ETAPA ${step.etapa} - ${step.nome}: Nota ${step.nota}/10`);
        addText(stepsText);
    }

    // Justificativa detalhada
    if(data.justificativaDetalhada?.length) {
        addSectionBreak();
        addHeading("Justificativa Detalhada das Notas (< 10/10)");
        (data.justificativaDetalhada ?? []).forEach(item => {
            addSubHeading(`${item.nomeEtapa} - Nota ${item.nota}`, { bold: true });
            addText([
                `Por que da Técnica: ${item.porqueDaTecnica}`,
                `O que fez bem: ${item.oQueFezBem}`,
                `Pontos de Melhoria: ${item.pontosDeMelhoria}`,
                `Como Estevão Faria: "${item.comoEstevaoFaria}"`,
            ]);
        });
    }
    
    // Acertos e Erros
    if (data.acertosIdentificados?.length || data.errosParaCorrecao?.length) {
        addSectionBreak();
        addHeading("Acertos e Erros Principais");
        if(data.acertosIdentificados?.length) {
            addSubHeading("Acertos Identificados", { bold: true });
            addText((data.acertosIdentificados ?? []).map(item => `- ${item.nomeEtapa}`));
        }
        if(data.errosParaCorrecao?.length) {
            addSubHeading("Erros para Correção", { bold: true });
            (data.errosParaCorrecao ?? []).forEach(item => {
                addText([
                    `${item.nomeEtapa}:`,
                    `  - Porque foi erro: ${item.porqueFoiErro}`,
                    `  - Como Estevão faria: "${item.comoEstevaoFaria}"`,
                ]);
            });
        }
    }
};

const exportVendaRealizadaPDF = (data: VendaRealizadaReportData) => {
    addTitle(`Relatório de Venda Realizada (3 Blocos)`);
    addSubHeading(`Vendedor: ${data.closerName}`);
    addSubHeading(`Arquivo: ${data.fileName}`);
    addSubHeading(`Pontuação Total: ${data.totalScore}/${data.totalMaxScore}`, { bold: true });

    addSectionBreak();
    addHeading("Bloco 1: Pontos Positivos");
    addText(data.pontosPositivos.descricao);
    data.pontosPositivos.detalhes.forEach(detalhe => {
        addSubHeading(detalhe.etapa, { bold: true });
        addText([
            `O que ele falou: "${detalhe.oQueEleFalou}"`,
            `Como o lead reagiu: ${detalhe.comoLeadReagiu}`,
            `Por que funcionou: ${detalhe.porqueFuncionou}`
        ]);
    });

    addSectionBreak();
    addHeading("Bloco 2: Crítica Construtiva");
    addText(data.criticaConstrutiva.descricao);
    data.criticaConstrutiva.detalhes.forEach(detalhe => {
        addSubHeading(`Trecho do Closer: "${detalhe.trechoCloser}"`, { bold: false });
        addText([
            `Erro: ${detalhe.erro}`,
            `Como Estevão faria: ${detalhe.comoEstevaoFaria}`,
            `Impacto: ${detalhe.impacto}`
        ]);
    });
    
    addSectionBreak();
    addHeading("Bloco 3: Elogio Final e Direcionamento");
    addText(data.elogioFinal.descricao);
    addSubHeading("Detalhes:", { bold: true });
    addText([
        `Reforçar Pontos: ${data.elogioFinal.detalhes.reforcarPontos}`,
        `Mostrar 80/20: ${data.elogioFinal.detalhes.mostrar8020}`,
        `Focos de Treino: ${data.elogioFinal.detalhes.focosDeTreino}`,
        `Elogio Pesado: ${data.elogioFinal.detalhes.elogioPesado}`
    ]);
};

export const exportReportAsPDF = (reportData: AnalysisResult, fileName: string): void => {
    // @ts-ignore
    const { jsPDF } = jspdf;
    doc = new jsPDF('p', 'mm', 'a4');
    y = MARGIN; // Reset y position for each new document

    switch (reportData.type) {
        case 'successful':
            exportSuccessfulCallPDF(reportData);
            break;
        case 'lost':
            exportLostCallPDF(reportData);
            break;
        case 'venda-realizada':
            exportVendaRealizadaPDF(reportData);
            break;
        case 'relatorio-cirurgico':
            console.log("PDF export for 'Relatório Cirúrgico' is not yet implemented.");
            alert("A exportação de PDF para este tipo de relatório ainda não está disponível.");
            return; // Exit without saving
        case 'relatorio-segunda-call':
            alert("A exportação de PDF para o 'Dossiê Estratégico' ainda não está disponível.");
            return; // Exit without saving
        case 'baseline-indicacao':
            alert("A exportação de PDF para o 'Baseline de Indicação' ainda não está disponível.");
            return; // Exit without saving
        default:
            console.error('Unknown report type for PDF export');
            return;
    }

    doc.save(fileName);
};