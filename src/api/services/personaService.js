import { authPrivateApi, unwrapApiData } from '../axios';

export const fetchPersonas = async () => unwrapApiData(await authPrivateApi.get('/persona'));

export const fetchPersona = async (personaId) =>
  unwrapApiData(await authPrivateApi.get(`/persona/${personaId}`));

export const createPersona = async (body) =>
  unwrapApiData(await authPrivateApi.post('/persona', body));

export const updatePersona = async (personaId, body) => {
  await authPrivateApi.put(`/persona/${personaId}`, body);
};

export const deletePersona = async (personaId) => {
  await authPrivateApi.delete(`/persona/${personaId}`);
};
