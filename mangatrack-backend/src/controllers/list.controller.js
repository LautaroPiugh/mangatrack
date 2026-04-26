const listService = require('../services/list.service');

const getMyLists = async (req, res) => {
  const lists = await listService.getMyLists(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Tus listas fueron obtenidas correctamente.',
    data: lists,
    meta: {
      total: lists.length,
    },
  });
};

const createList = async (req, res) => {
  const list = await listService.createList(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Lista creada correctamente.',
    data: list,
  });
};

const getListById = async (req, res) => {
  const list = await listService.getListById(req.params.id, req.user || null);

  res.status(200).json({
    success: true,
    message: 'Lista obtenida correctamente.',
    data: list,
  });
};

const updateList = async (req, res) => {
  const list = await listService.updateList(req.params.id, req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Lista actualizada correctamente.',
    data: list,
  });
};

const deleteList = async (req, res) => {
  const list = await listService.deleteList(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Lista eliminada correctamente.',
    data: list,
  });
};

const addItemToList = async (req, res) => {
  const list = await listService.addItemToList(req.params.id, req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Manga agregado correctamente a la lista.',
    data: list,
  });
};

const removeItemFromList = async (req, res) => {
  const list = await listService.removeItemFromList(req.params.id, req.user.id, req.params.mangaId);

  res.status(200).json({
    success: true,
    message: 'Manga eliminado correctamente de la lista.',
    data: list,
  });
};

const reorderListItems = async (req, res) => {
  const list = await listService.reorderListItems(req.params.id, req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Lista reordenada correctamente.',
    data: list,
  });
};

const getUserLists = async (req, res) => {
  const result = await listService.getUserLists(req.params.username, req.user || null);

  res.status(200).json({
    success: true,
    message: 'Listas del usuario obtenidas correctamente.',
    data: result.items,
    meta: {
      total: result.items.length,
      user: result.user,
    },
  });
};

const getUserListByUsername = async (req, res) => {
  const result = await listService.getUserListByUsername(req.params.username, req.params.listId, req.user || null);

  res.status(200).json({
    success: true,
    message: 'Lista pública obtenida correctamente.',
    data: result.list,
    meta: {
      user: result.user,
    },
  });
};

module.exports = {
  getMyLists,
  createList,
  getListById,
  updateList,
  deleteList,
  addItemToList,
  removeItemFromList,
  reorderListItems,
  getUserLists,
  getUserListByUsername,
};
