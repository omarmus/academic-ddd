import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../templates/MainLayout";
import { Button } from "../../atoms/Button";
import { DataTable, type DataTableColumn } from "../../organisms/DataTable";
import { getProgramsPaginated, deleteProgram, type Program } from "../../../services/programService";

const PROGRAM_COLUMNS: DataTableColumn<Program>[] = [
  { id: "code", label: "Código", sortable: true, value: (r) => r.code, render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.code}</span> },
  { id: "name", label: "Nombre", sortable: true, value: (r) => r.name },
  { id: "credits_required", label: "Créditos Requeridos", sortable: false, value: (r) => r.credits_required ?? "" },
  { id: "department_id", label: "Departamento", sortable: true, value: (r) => r.department_id ?? "" },
];

export function ProgramasPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<string | null>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProgramsPaginated({
        page,
        pageSize,
        sortBy: 'sortKey ?? undefined',
        sortOrder: sortDir,
      });
      setPrograms(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar programas");
      setPrograms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortKey, sortDir]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const handleDelete = async (program: Program) => {
    if (!window.confirm(`¿Eliminar el programa ${program.name}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setError(null);
    setDeletingId(program.id);
    try {
      await deleteProgram(program.id);
      await loadPrograms();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setDeletingId(null);
    }   };

  const renderActions = (program: Program) => (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => navigate(`/programas/${program.id}/editar`)}
          className="text-blue-500 hover:underline"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => handleDelete(program)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50"
          disabled={deletingId === program.id}
        >
          {deletingId === program.id ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    );

    return (
      <MainLayout>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/95 dark:ring-slate-600/50 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">PROGRAMAS</h1>
            <Button type="button" onClick={() => navigate("/programas/registro")}>
              Nuevo Programa
            </Button>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            <DataTable<Program>
              columns={PROGRAM_COLUMNS}
              data={programs}
              total={total}
              page={page}
              pageSize={pageSize}
              sortKey={sortKey}
              sortDir={sortDir}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onSortChange={(key, dir) => {
                setSortKey(key);
                setSortDir(dir);
              }}
              keyExtractor={(row) => row.id}
              loading={loading}
              renderActions={renderActions}
              defaultPageSize={10}
              emptyMessage="no hay programas registrados"
            />
          </div>
          {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
      </MainLayout>
    );

}
