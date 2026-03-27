import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../templates/MainLayout";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { createProgram } from "../../../services/programService";

export function RegisterProgramPage() {

  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [creditsRequired, setCreditsRequired] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent)=> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createProgram({
        code: code.trim(),
        name: name.trim(),
        credits_required: Number(creditsRequired),
        department_id: departmentId.trim(),
      });
      navigate("/programas", {state: {registered: true}});
    } catch (error) {
      console.error("Error creating program:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/95 dark:ring-slate-600/50 sm:p-10 w-full">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Agregar programa académico
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
          Completa el siguiente formulario para agregar un nuevo programa académico.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 w-full xl:max-w-[70%]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Código
              </label>
              <Input
                id="code"
                name="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nombre
              </label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="creditsRequired" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Créditos requeridos
              </label>
              <Input
                id="creditsRequired"
                name="creditsRequired"
                type="number"
                value={creditsRequired}
                onChange={(e) => setCreditsRequired(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="departamentId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                ID del departamento
              </label>
              <Input
                id="departmentId"
                name="departmentId"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex items-center gap-x-6">
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar programa"}
            </Button>
            <button type="button"
            onClick={() => navigate("/programas")}
            className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
