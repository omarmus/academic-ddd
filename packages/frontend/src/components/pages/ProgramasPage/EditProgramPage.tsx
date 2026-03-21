import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../templates/MainLayout';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { getProgram, updateProgram } from '../../../services/programService';

export function EditProgramPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits_required, setCreditsRequired] = useState(0);
  const [departament_id, setDepartamentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getProgram(id);
        setCode(data.code);
        setName(data.name);
        setCreditsRequired(data.credits_required);
        setDepartamentId(data.departament_id);
        setLoading(false);
      } catch (error) {
        setError('Error fetching program data');
        setLoading(false);
      }finally {
        setLoadingData(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      await updateProgram(id, {
        code: code.trim(),
        name: name.trim(),
        credits_required: credits_required,
        departament_id: departament_id.trim()
      });
      navigate('/programas/', { state: { updated: true } });
    } catch (error) {
      setError('Error updating program');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/95 dark:ring-slate-600/50 sm:p-10 w-full">
        <p className='"text-slate-600 dark:text-slate-300'>Cargando...</p>
      </div>
    </MainLayout>
 );

  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/95 dark:ring-slate-600/50 sm:p-10 w-full">
        <h2 className="text-2xl font-bold mb-6">Editar Programa</h2>
        <p className="text-slate-600 dark:text-slate-300">Edita los detalles del programa a continuación:</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <Input
                id="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder='Ej. CS101'
              />
            </div>
            <div>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Ej. Introducción a la Programación'
              />
            </div>
            <div>
              <Input
                id="credits_required"
                type="number"
                required
                value={credits_required}
                onChange={(e) => setCreditsRequired(Number(e.target.value))}
                placeholder='Ej. 4'
              />
            </div>
            <div>
              <Input
                id="departament_id"
                type="text"
                required
                value={departament_id}
                onChange={(e) => setDepartamentId(e.target.value)}
                placeholder='Ej. CS'
              />
            </div>
          </div>
          {error && (
            <p className="mt-5 text-sm text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </Button>
            <button
              type="button"
              onClick={() => navigate(`/programas`)}
              className="ml-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
