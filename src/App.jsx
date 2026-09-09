import { useEffect, useState } from 'react';
import {
  listarPosts,
  crearPost,
  editarPost,
  borrarPost,
} from './api/posts';

function App() {
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const [editando, setEditando] = useState(null);
  const [borrador, setBorrador] = useState('');

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarPosts() {
      setCargando(true);
      setError(null);

      try {
        const datos = await listarPosts({
          limite: 10,
          signal: controlador.signal,
        });

        setPosts(datos);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setError(e.message);
        }
      } finally {
        setCargando(false);
      }
    }

    cargarPosts();

    return () => controlador.abort();
  }, []);

  async function enviar(evento) {
    evento.preventDefault();
    setGuardando(true);
    setErrorForm(null);

    try {
      const creado = await crearPost({
        title: titulo,
        body: cuerpo,
      });

      setPosts(actuales => [creado, ...actuales]);
      setTitulo('');
      setCuerpo('');
    } catch (e) {
      setErrorForm(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id) {
    const respaldo = posts;

    setPosts(actuales =>
      actuales.filter(post => post.id !== id)
    );

    try {
      await borrarPost(id);
    } catch (e) {
      setPosts(respaldo);
      alert(`No se pudo borrar: ${e.message}`);
    }
  }

  function empezarEdicion(post) {
    setEditando(post.id);
    setBorrador(post.title);
  }

  async function guardarEdicion(id) {
    try {
      const actualizado = await editarPost(id, {
        title: borrador,
      });

      setPosts(actuales =>
        actuales.map(post =>
          post.id === id
            ? { ...post, ...actualizado }
            : post
        )
      );

      setEditando(null);
      setBorrador('');
    } catch (e) {
      alert(`No se pudo guardar: ${e.message}`);
    }
  }

  return (
    <main className="contenedor">
      <h1>Gestor de publicaciones</h1>

      <form className="formulario" onSubmit={enviar}>
        <input
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Título del post"
        />

        <textarea
          value={cuerpo}
          onChange={e => setCuerpo(e.target.value)}
          placeholder="Contenido…"
          rows="3"
        />

        {errorForm && (
          <p className="estado--error">
            ⚠️ {errorForm}
          </p>
        )}

        <button
          type="submit"
          disabled={
            guardando || titulo.trim().length < 3
          }
        >
          {guardando ? 'Guardando…' : 'Publicar'}
        </button>
      </form>

      {cargando && (
        <p className="estado">Cargando publicaciones…</p>
      )}

      {error && (
        <p className="estado estado--error">
          ⚠️ {error}
        </p>
      )}

      {!cargando && !error && posts.length === 0 && (
        <p className="estado">
          No hay publicaciones.
        </p>
      )}

      {!cargando &&
        !error &&
        posts.map(post => (
          <article key={post.id} className="post">
            {editando === post.id ? (
              <>
                <input
                  value={borrador}
                  onChange={e =>
                    setBorrador(e.target.value)
                  }
                />

                <div className="acciones">
                  <button
                    onClick={() =>
                      guardarEdicion(post.id)
                    }
                  >
                    Guardar
                  </button>

                  <button
                    onClick={() => setEditando(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>{post.title}</h3>
                <p>{post.body}</p>

                <div className="acciones">
                  <button
                    onClick={() =>
                      empezarEdicion(post)
                    }
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      eliminar(post.id)
                    }
                  >
                    Borrar
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
    </main>
  );
}

export default App;