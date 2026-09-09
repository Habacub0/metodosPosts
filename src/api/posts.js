const BASE = 'https://jsonplaceholder.typicode.com';

async function pedir(ruta, opciones = {}) {
  const res = await fetch(`${BASE}${ruta}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...opciones,
  });

  if (!res.ok) {
    throw new Error(
      `Error ${res.status} al ${opciones.method ?? 'GET'} ${ruta}`
    );
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

export function listarPosts({ limite = 10, signal } = {}) {
  return pedir(`/posts?_limit=${limite}`, { signal });
}

export function crearPost({ title, body, userId = 1 }) {
  return pedir('/posts', {
    method: 'POST',
    body: JSON.stringify({ title, body, userId }),
  });
}

export function editarPost(id, cambios) {
  return pedir(`/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(cambios),
  });
}

export function borrarPost(id) {
  return pedir(`/posts/${id}`, {
    method: 'DELETE',
  });
}