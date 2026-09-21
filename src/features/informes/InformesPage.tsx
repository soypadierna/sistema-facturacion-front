import { useEffect, useState } from 'react';
import { ApiError } from '@/shared/api/httpClient';
import { formatDate, todayLocalISO, firstOfMonthLocalISO } from '@/shared/utils/date';
import * as informesApi from './informesApi';
import type { TipoInforme, Informe, Seccion } from './types';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { showToast } from '@/components/ui/Toast';
import { BarChart3, Calendar, Download, FileBarChart } from 'lucide-react';

function errMsg(e: unknown): string {
    return e instanceof ApiError ? e.message : 'Error de conexión';
}

function formatValue(value: string | number, format: string): string {
    if (format === 'moneda') {
        return '$' + Number(value).toLocaleString('es', { minimumFractionDigits: 2 });
    }
    if (format === 'entero') {
        return Number(value).toLocaleString('es');
    }
    if (format === 'fecha') {
        return formatDate(String(value));
    }
    return String(value);
}

function csvNumber(value: string | number, format: string): string {
    if (format === 'moneda' || format === 'entero') {
        return String(value).replace('.', ',');
    }
    return String(value);
}

function buildCsv(informe: Informe): string {
    const lines: string[] = [];
    for (const seccion of informe.secciones) {
        lines.push(seccion.titulo);
        if (seccion.kind === 'metricas') {
            lines.push(['Métrica', 'Valor'].join(';'));
            for (const item of seccion.items) {
                lines.push([item.label, csvNumber(item.value, item.format)].join(';'));
            }
        } else {
            lines.push(seccion.columnas.map((c) => c.label).join(';'));
            for (const fila of seccion.filas) {
                lines.push(
                    seccion.columnas
                        .map((c) => csvNumber(fila[c.key] ?? '', c.format))
                        .join(';')
                );
            }
        }
        lines.push('');
    }
    return '\uFEFF' + lines.join('\n');
}

export function InformesPage() {
    const [tipos, setTipos] = useState<TipoInforme[]>([]);
    const [loadingTipos, setLoadingTipos] = useState(true);
    const [tipoSeleccionado, setTipoSeleccionado] = useState('');
    const [desde, setDesde] = useState(firstOfMonthLocalISO());
    const [hasta, setHasta] = useState(todayLocalISO());
    const [generando, setGenerando] = useState(false);
    const [informe, setInforme] = useState<Informe | null>(null);

    useEffect(() => {
        async function load() {
            setLoadingTipos(true);
            try {
                const data = await informesApi.listTipos();
                setTipos(data);
                if (data.length > 0) setTipoSeleccionado(data[0].id);
            } catch (e) {
                showToast(errMsg(e), 'error');
                setTipos([]);
            }
            setLoadingTipos(false);
        }
        load();
    }, []);

    const tipoActual = tipos.find((t) => t.id === tipoSeleccionado);

    async function generar() {
        if (!tipoSeleccionado) return;
        if (tipoActual?.requiereFechas) {
            if (!desde || !hasta) {
                showToast('Selecciona el rango de fechas', 'error');
                return;
            }
            if (hasta < desde) {
                showToast('La fecha "hasta" debe ser mayor o igual a "desde"', 'error');
                return;
            }
            const diffDays = (new Date(hasta).getTime() - new Date(desde).getTime()) / 86400000;
            if (diffDays > 366) {
                showToast('El rango máximo permitido es de 366 días', 'error');
                return;
            }
        }
        setGenerando(true);
        try {
            const data = tipoActual?.requiereFechas
                ? await informesApi.getInforme(tipoSeleccionado, desde, hasta)
                : await informesApi.getInforme(tipoSeleccionado);
            setInforme(data);
        } catch (e) {
            showToast(errMsg(e), 'error');
        }
        setGenerando(false);
    }

    function exportarCsv() {
        if (!informe) return;
        const csv = buildCsv(informe);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const nombre = informe.tipo === 'inventario'
            ? `informes-inventario-${todayLocalISO()}.csv`
            : `informes-${informe.tipo}-${informe.desde}-${informe.hasta}.csv`;
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-xl font-bold text-slate-800">Informes</h3>
                <p className="text-sm text-slate-500 mt-1">Genera informes a partir de la información del sistema</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
                {loadingTipos ? (
                    <div className="flex justify-center py-6">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                    </div>
                ) : tipos.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Tu rol no tiene informes disponibles</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                        <Select label="Tipo de informe" value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)}>
                            {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </Select>
                        {tipoActual?.requiereFechas && (
                            <>
                                <Input label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} icon={<Calendar size={18} />} />
                                <Input label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} icon={<Calendar size={18} />} />
                            </>
                        )}
                        <Button onClick={generar} disabled={generando}>
                            {generando ? 'Generando...' : <><FileBarChart size={18} /> Generar</>}
                        </Button>
                    </div>
                )}
            </div>

            {!informe ? (
                tipos.length > 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <BarChart3 size={40} className="mb-2" />
                        <p className="text-sm">Selecciona un tipo y pulsa Generar</p>
                    </div>
                )
            ) : (
                <div className="space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h4 className="text-lg font-semibold text-slate-800">{informe.titulo}</h4>
                            <p className="text-sm text-slate-500 mt-1">
                                {informe.desde && informe.hasta && (
                                    <>Rango: {formatDate(informe.desde)} - {formatDate(informe.hasta)} · </>
                                )}
                                Generado: {new Date(informe.generadoEn).toLocaleString('es')}
                            </p>
                        </div>
                        <Button variant="secondary" onClick={exportarCsv}>
                            <Download size={16} /> Exportar CSV
                        </Button>
                    </div>

                    {informe.secciones.every((s) => (s.kind === 'metricas' ? s.items.length === 0 : s.filas.length === 0)) ? (
                        <p className="text-sm text-slate-400 text-center py-10 bg-white rounded-xl border border-slate-200">
                            Sin datos en el periodo
                        </p>
                    ) : (
                        informe.secciones.map((seccion: Seccion, i) => (
                            <div key={i} className="space-y-3">
                                <h5 className="text-sm font-semibold text-slate-700">{seccion.titulo}</h5>
                                {seccion.kind === 'metricas' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {seccion.items.map((item, j) => (
                                            <div key={j} className="bg-white rounded-xl border border-slate-200 p-5">
                                                <p className="text-sm text-slate-500">{item.label}</p>
                                                <p className="text-2xl font-bold text-slate-800 mt-1">{formatValue(item.value, item.format)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Table
                                        columns={seccion.columnas.map((c) => ({
                                            key: c.key,
                                            label: c.label,
                                            render: (fila: Record<string, string | number>) => formatValue(fila[c.key] ?? '', c.format),
                                        }))}
                                        data={seccion.filas}
                                        rowKey={(fila: Record<string, string | number>) => JSON.stringify(fila)}
                                        emptyMessage="Sin datos"
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}