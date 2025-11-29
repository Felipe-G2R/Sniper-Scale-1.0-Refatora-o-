import React, { useState, useRef, useCallback, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { ANALYSIS_MODELS } from '../constants';
import type { DashboardStat, AnalysisModel, ResultsDistribution, DashboardMetrics } from '../types';
import { UploadCloudIcon, FileTextIcon, LoaderIcon, UserGroupIcon, UserIcon, EyeIcon } from './icons';
import { useAnalysisManager } from '../hooks/useAnalysisManager';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';


const DashboardStatCard: React.FC<DashboardStat> = ({ title, value, subtitle, icon }) => (
    <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-5 flex items-start justify-between">
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        {icon}
    </div>
);

const ChartEmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">{message}</p>
    </div>
);

const AnalysisUploadModal: React.FC = () => {
    const { state, startAnalysis, setIsModalOpen } = useAnalysisManager();
    const { isModalOpen, isLoading, error } = state;

    const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('single');
    const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
    
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [text1, setText1] = useState<string>('');
    const [text2, setText2] = useState<string>('');

    const [fileError, setFileError] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<AnalysisModel | null>(null);

    const fileInputRef1 = useRef<HTMLInputElement>(null);
    const fileInputRef2 = useRef<HTMLInputElement>(null);

    const validateFile = (selectedFile: File): boolean => {
        setFileError(null);
        const allowedTypes = ['application/pdf', 'text/plain', 'text/csv'];
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!allowedTypes.includes(selectedFile.type)) {
            setFileError('Tipo de arquivo inválido. Use PDF, TXT ou CSV.');
            return false;
        }
        if (selectedFile.size > maxSize) {
            setFileError('O arquivo excede o limite de 50MB.');
            return false;
        }
        return true;
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, part: 1 | 2) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && validateFile(selectedFile)) {
            if (part === 1) setFile1(selectedFile);
            else setFile2(selectedFile);
        }
    };

    const handleDragOver = useCallback((event: React.DragEvent) => { event.preventDefault(); }, []);

    const handleDrop = useCallback((event: React.DragEvent, part: 1 | 2) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile && validateFile(droppedFile)) {
            if (part === 1) setFile1(droppedFile);
            else setFile2(droppedFile);
        }
    }, []);

    const handleAnalyseClick = () => {
        if (selectedModel) {
            if (inputMode === 'upload') {
                if (uploadMode === 'single' && file1) {
                    startAnalysis(file1, selectedModel, true);
                } else if (uploadMode === 'multiple' && file1 && file2) {
                    startAnalysis([file1, file2], selectedModel, true);
                }
            } else { // paste mode
                if (uploadMode === 'single' && text1.trim()) {
                    const fileFromText = new File([text1.trim()], "transcricao_colada.txt", { type: "text/plain" });
                    startAnalysis(fileFromText, selectedModel, true);
                } else if (uploadMode === 'multiple' && text1.trim() && text2.trim()) {
                    const file1FromText = new File([text1.trim()], "transcricao_parte1.txt", { type: "text/plain" });
                    const file2FromText = new File([text2.trim()], "transcricao_parte2.txt", { type: "text/plain" });
                    startAnalysis([file1FromText, file2FromText], selectedModel, true);
                }
            }
        }
    };
    

    const Dropzone: React.FC<{ part: 1 | 2; file: File | null; onClear: () => void; }> = ({ part, file, onClear }) => (
        <div>
            <input type="file" ref={part === 1 ? fileInputRef1 : fileInputRef2} onChange={(e) => handleFileChange(e, part)} accept=".pdf,.txt,.csv" className="hidden" />
            {!file ? (
                <div 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, part)}
                    onClick={() => (part === 1 ? fileInputRef1 : fileInputRef2).current?.click()} 
                    className="w-full bg-[#0D1117] border-2 border-dashed border-gray-700 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-cyan-400/50 transition-colors min-h-[68px]"
                >
                    <UploadCloudIcon className="w-6 h-6 text-gray-500 mr-3 flex-shrink-0" />
                    <div className="text-left">
                        <span className="text-sm font-semibold text-gray-300">{uploadMode === 'single' ? 'Arraste um arquivo ou clique para selecionar' : `Parte ${part}`}</span>
                        <p className="text-xs text-gray-500">Suporta PDF, TXT, CSV (Max 50MB)</p>
                    </div>
                </div>
            ) : (
                <div className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 flex items-center justify-between min-h-[68px]">
                    <div className="flex items-center overflow-hidden">
                        <FileTextIcon className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-white truncate font-semibold" title={file.name}>{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button onClick={onClear} className="text-gray-500 hover:text-white p-1 rounded-full text-lg leading-none flex-shrink-0 ml-2 self-start">&times;</button>
                </div>
            )}
        </div>
    );
    
    const TextareaZone: React.FC<{ part: 1 | 2; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; }> = ({ part, value, onChange }) => (
        <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">{uploadMode === 'single' ? 'Cole a transcrição da call completa' : `Parte ${part}`}</label>
            <textarea
                value={value}
                onChange={onChange}
                placeholder={`Cole o conteúdo da ${uploadMode === 'single' ? 'call' : `parte ${part}`} aqui...`}
                className="w-full bg-[#0D1117] border-2 border-gray-700 rounded-lg p-4 text-sm text-gray-300 focus:border-cyan-400 focus:ring-0 transition-colors h-36 resize-y"
            />
        </div>
    );

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setIsModalOpen(false)}>
            <div className="bg-[#161b22] border border-gray-700 rounded-2xl shadow-xl w-full max-w-3xl p-8 m-4 animate-fade-in-up relative" onClick={(e) => e.stopPropagation()}>
                {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 rounded-2xl">
                        <LoaderIcon className="w-12 h-12 text-cyan-400 animate-spin"/>
                        <p className="text-white mt-4">Analisando sua call...</p>
                        <p className="text-gray-400 text-sm mt-1">Isso pode levar alguns instantes...</p>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Vamos iniciar sua análise</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <p className="text-gray-400 mt-1">Escolha um áudio, vídeo ou conversa para gerarmos insights práticos de vendas.</p>

                <div className="mt-6 flex border-b border-gray-700">
                    <button
                        onClick={() => setInputMode('upload')}
                        className={`px-4 py-3 text-sm font-semibold transition-colors ${inputMode === 'upload' ? 'border-b-2 border-cyan-400 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Upload de Arquivo
                    </button>
                    <button
                        onClick={() => setInputMode('paste')}
                        className={`px-4 py-3 text-sm font-semibold transition-colors ${inputMode === 'paste' ? 'border-b-2 border-cyan-400 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Colar Transcrição
                    </button>
                </div>


                <div className="mt-4 flex justify-center p-1 bg-gray-800 rounded-lg">
                    <button onClick={() => setUploadMode('single')} className={`px-4 py-1.5 text-sm font-semibold rounded-md w-1/2 transition-colors ${uploadMode === 'single' ? 'bg-cyan-500 text-black' : 'text-gray-400'}`}>Call Completa</button>
                    <button onClick={() => setUploadMode('multiple')} className={`px-4 py-1.5 text-sm font-semibold rounded-md w-1/2 transition-colors ${uploadMode === 'multiple' ? 'bg-cyan-500 text-black' : 'text-gray-400'}`}>Parte 1 + Parte 2</button>
                </div>

                <div className="mt-4 min-h-[148px]">
                    {inputMode === 'upload' ? (
                         uploadMode === 'single' ? (
                            <Dropzone part={1} file={file1} onClear={() => setFile1(null)} />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Dropzone part={1} file={file1} onClear={() => setFile1(null)} />
                                <Dropzone part={2} file={file2} onClear={() => setFile2(null)} />
                            </div>
                        )
                    ) : (
                        uploadMode === 'single' ? (
                            <TextareaZone part={1} value={text1} onChange={(e) => setText1(e.target.value)} />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextareaZone part={1} value={text1} onChange={(e) => setText1(e.target.value)} />
                                <TextareaZone part={2} value={text2} onChange={(e) => setText2(e.target.value)} />
                            </div>
                        )
                    )}
                </div>
                {fileError && <p className="text-red-500 text-xs mt-2">{fileError}</p>}
                
                <div className="mt-6">
                    <h3 className="text-md font-semibold text-gray-300">Modelo de Análise</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                        {ANALYSIS_MODELS.filter(m => m.id !== 'universal' && m.id !== 'next-level' && m.id !== 'relatorio-segunda-call').map(model => (
                            <button key={model.id} onClick={() => setSelectedModel(model)} className={`p-4 rounded-lg border-2 text-left transition-colors h-full ${selectedModel?.id === model.id ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
                                <h4 className="font-bold text-white text-sm">{model.title}</h4>
                                <p className="text-xs text-gray-400 mt-1">{model.description}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {model.tags.map(tag => <span key={tag} className="text-xs bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded-full">{tag}</span>)}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                 {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleAnalyseClick}
                        disabled={
                            !selectedModel || isLoading ||
                            (inputMode === 'upload' && ((uploadMode === 'single' && !file1) || (uploadMode === 'multiple' && (!file1 || !file2)))) ||
                            (inputMode === 'paste' && ((uploadMode === 'single' && !text1.trim()) || (uploadMode === 'multiple' && (!text1.trim() || !text2.trim()))))
                        }
                        className="px-6 py-3 text-sm font-semibold text-black bg-[#22d3ee] rounded-lg hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Analisar Call
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { setIsModalOpen, setDateFilter, state } = useAnalysisManager();
    const { startDate, endDate } = state;
    const { stats, resultsDistribution, conversionHistory, recentCallsData, totalCalls } = useDashboardMetrics();

    const [localStartDate, setLocalStartDate] = useState(startDate || '');
    const [localEndDate, setLocalEndDate] = useState(endDate || '');

    useEffect(() => {
        setLocalStartDate(startDate || '');
        setLocalEndDate(endDate || '');
    }, [startDate, endDate]);

    const handleFilter = () => {
        setDateFilter(localStartDate || null, localEndDate || null);
    };

    const handleClear = () => {
        setLocalStartDate('');
        setLocalEndDate('');
        setDateFilter(null, null);
    };


    const renderCustomizedLegend = (props: any) => {
        const { payload } = props;
        return (
            <ul className="flex justify-center space-x-4 mt-2">
                {payload.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center text-sm text-gray-400">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                        {entry.value} ({totalCalls > 0 ? ((entry.payload.value / (resultsDistribution.reduce((acc, curr) => acc + curr.value, 0))) * 100).toFixed(0) : 0}%)
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <AnalysisUploadModal />
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Visão geral da sua performance de vendas.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <label htmlFor="start-date-dash" className="text-gray-400 sr-only">Data de Início</label>
                        <input id="start-date-dash" type="date" value={localStartDate} onChange={(e) => setLocalStartDate(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"/>
                        <span className="text-gray-500">-</span>
                        <label htmlFor="end-date-dash" className="text-gray-400 sr-only">Data de Fim</label>
                        <input id="end-date-dash" type="date" value={localEndDate} onChange={(e) => setLocalEndDate(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"/>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <button onClick={handleFilter} className="px-4 py-2.5 font-semibold text-black bg-[#22d3ee] rounded-lg hover:bg-cyan-400">Filtrar</button>
                        {(startDate || endDate) && <button onClick={handleClear} className="px-4 py-2.5 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Limpar</button>}
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 text-sm font-semibold text-black bg-[#22d3ee] rounded-lg hover:bg-cyan-400">
                        Analisar Call
                    </button>
                </div>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => <DashboardStatCard key={stat.title} {...stat} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Evolução da Taxa de Conversão</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        {totalCalls > 0 ? (
                            <ResponsiveContainer>
                                <LineChart data={conversionHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} stroke="#6B7280" />
                                    <YAxis tick={{ fill: '#9CA3AF' }} stroke="#6B7280" unit="%" domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                                    <Line type="monotone" dataKey="conversao" stroke="#22d3ee" strokeWidth={2} dot={false} name="Conversão" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <ChartEmptyState message="Realize análises para ver a evolução da sua conversão." />}
                    </div>
                </div>
                <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Distribuição de Resultados</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        {totalCalls > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={resultsDistribution as any} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                        {resultsDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                                    <Legend content={renderCustomizedLegend} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <ChartEmptyState message="Nenhum resultado para exibir." />}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Pontuação das Últimas Calls</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        {totalCalls > 0 ? (
                            <ResponsiveContainer>
                                <BarChart data={recentCallsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} stroke="#6B7280" />
                                    <YAxis tick={{ fill: '#9CA3AF' }} stroke="#6B7280" unit="/10" domain={[0, 10]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} cursor={{fill: 'rgba(34, 211, 238, 0.1)'}}/>
                                    <Bar dataKey="score" fill="#22d3ee" name="Pontuação" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <ChartEmptyState message="Nenhuma call recente para exibir." />}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;