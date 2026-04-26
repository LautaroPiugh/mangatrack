const { isValidObjectId } = require('mongoose');

const listRepository = require('../repositories/list.repository');
const mangaRepository = require('../repositories/manga.repository');
const userRepository = require('../repositories/user.repository');
const { recordActivitySafely } = require('./activity.service');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require('../utils/errors');
const { normalizeOptionalString, sanitizePublicUser } = require('../utils/user');

const DEFAULT_LISTS = [
  {
    title: 'Leyendo',
    description: 'Mangas que estás siguiendo ahora mismo.',
  },
  {
    title: 'Completados',
    description: 'Series terminadas que ya cerraste.',
  },
  {
    title: 'Quiero leer',
    description: 'Pendientes que querés arrancar pronto.',
  },
  {
    title: 'Pausados',
    description: 'Lecturas en pausa para retomar más adelante.',
  },
  {
    title: 'Abandonados',
    description: 'Series que decidiste dejar.',
  },
];

const ensureValidListId = (listId) => {
  if (!isValidObjectId(listId)) {
    throw new BadRequestError('El id de la lista no es valido.');
  }
};

const ensureValidMangaId = (mangaId) => {
  if (!isValidObjectId(mangaId)) {
    throw new BadRequestError('El id del manga no es valido.');
  }
};

const getListMangaId = (item) => item?.manga?._id?.toString?.() || item?.manga?.toString?.() || item?.manga;

const normalizeExistingListItem = (item, index = 0) => ({
  manga: getListMangaId(item),
  note: normalizeOptionalString(item?.note),
  order: Number.isInteger(item?.order) ? item.order : index,
  addedAt: item?.addedAt || new Date(),
});

const ensureMangaExists = async (mangaId) => {
  ensureValidMangaId(mangaId);

  const manga = await mangaRepository.findById(mangaId, {
    populateCreatedBy: false,
  });

  if (!manga) {
    throw new NotFoundError('Manga no encontrado.');
  }

  return manga;
};

const ensureUserExists = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  return user;
};

const getListOrThrow = async (listId, options = {}) => {
  ensureValidListId(listId);

  const list = await listRepository.findById(listId, options);

  if (!list) {
    throw new NotFoundError('Lista no encontrada.');
  }

  return list;
};

const isListOwner = (list, userId) => (
  Boolean(userId) && list.owner?._id?.toString?.() === userId.toString()
);

const ensureListOwner = (list, userId) => {
  if (!isListOwner(list, userId)) {
    throw new NotFoundError('Lista no encontrada.');
  }
};

const ensureListAccess = (list, currentUser = null) => {
  if (list.visibility === 'public' || isListOwner(list, currentUser?.id)) {
    return;
  }

  throw new NotFoundError('Lista no encontrada.');
};

const ensureUniqueListTitle = async (ownerId, title, currentListId = null) => {
  const duplicatedList = await listRepository.findOneByOwnerAndTitle(ownerId, title, {
    populateItems: false,
    populateOwner: false,
  });

  if (duplicatedList && duplicatedList._id.toString() !== currentListId?.toString()) {
    throw new ConflictError('Ya existe una lista con ese titulo.');
  }
};

const ensureDefaultLists = async (userId) => {
  const existingLists = await listRepository.findByOwnerId(userId, {}, {
    populateItems: false,
    populateOwner: false,
    sort: { createdAt: 1 },
  });

  const existingTitles = new Set(
    existingLists.map((list) => list.title.trim().toLowerCase()),
  );

  const missingLists = DEFAULT_LISTS
    .filter((list) => !existingTitles.has(list.title.toLowerCase()))
    .map((list) => ({
      owner: userId,
      title: list.title,
      description: list.description,
      visibility: 'private',
      isDefault: true,
      items: [],
    }));

  if (missingLists.length) {
    try {
      await listRepository.insertMany(missingLists);
    } catch {
      // Ignore duplicated inserts from concurrent requests.
    }
  }
};

const buildListPayload = (payload = {}) => {
  const nextPayload = {};

  if (payload.title !== undefined) {
    nextPayload.title = payload.title.trim();
  }

  if (payload.description !== undefined) {
    nextPayload.description = normalizeOptionalString(payload.description);
  }

  if (payload.visibility !== undefined) {
    nextPayload.visibility = payload.visibility;
  }

  return nextPayload;
};

const getMyLists = async (userId) => {
  await ensureUserExists(userId);
  await ensureDefaultLists(userId);

  return listRepository.findByOwnerId(userId, {}, {
    sort: { updatedAt: -1, createdAt: -1 },
  });
};

const createList = async (userId, payload = {}) => {
  await ensureUserExists(userId);

  const listPayload = buildListPayload(payload);

  if (!listPayload.title) {
    throw new BadRequestError('El titulo de la lista es obligatorio.');
  }

  await ensureUniqueListTitle(userId, listPayload.title);

  const createdList = await listRepository.create({
    owner: userId,
    title: listPayload.title,
    description: listPayload.description || null,
    visibility: listPayload.visibility || 'private',
    items: [],
  });

  if (createdList.visibility === 'public') {
    await recordActivitySafely({
      user: userId,
      type: 'list_created',
      list: createdList._id,
      visibility: 'public',
      metadata: {
        title: createdList.title,
      },
    });
  }

  return listRepository.findById(createdList._id);
};

const getListById = async (listId, currentUser = null) => {
  const list = await getListOrThrow(listId);
  ensureListAccess(list, currentUser);
  return list;
};

const updateList = async (listId, userId, payload = {}) => {
  const list = await getListOrThrow(listId);
  ensureListOwner(list, userId);

  const listPayload = buildListPayload(payload);

  if (Object.keys(listPayload).length === 0) {
    throw new BadRequestError('Debes enviar al menos un campo para actualizar la lista.');
  }

  if (listPayload.title) {
    await ensureUniqueListTitle(userId, listPayload.title, list._id);
  }

  return listRepository.updateById(list._id, listPayload);
};

const deleteList = async (listId, userId) => {
  const list = await getListOrThrow(listId);
  ensureListOwner(list, userId);

  await listRepository.deleteById(list._id);
  return list;
};

const addItemToList = async (listId, userId, payload = {}) => {
  const list = await getListOrThrow(listId);
  ensureListOwner(list, userId);

  const manga = await ensureMangaExists(payload.mangaId);
  const mangaId = manga._id.toString();
  const hasDuplicate = (list.items || [])
    .some((item) => getListMangaId(item) === mangaId);

  if (hasDuplicate) {
    throw new ConflictError('El manga ya existe en esta lista.');
  }

  const normalizedItems = (list.items || [])
    .map((item, index) => normalizeExistingListItem(item, index));

  normalizedItems.push({
    manga: manga._id,
    note: normalizeOptionalString(payload.note),
    order: normalizedItems.length,
    addedAt: new Date(),
  });

  const updatedList = await listRepository.updateById(list._id, {
    items: normalizedItems,
  });

  if (list.visibility === 'public') {
    await recordActivitySafely({
      user: userId,
      type: 'manga_added_to_list',
      manga: manga._id,
      list: list._id,
      visibility: 'public',
      metadata: {
        listTitle: list.title,
      },
    });
  }

  return updatedList;
};

const removeItemFromList = async (listId, userId, mangaId) => {
  const list = await getListOrThrow(listId);
  ensureListOwner(list, userId);
  ensureValidMangaId(mangaId);

  const remainingItems = (list.items || [])
    .filter((item) => getListMangaId(item) !== mangaId)
    .map((item, index) => ({
      ...normalizeExistingListItem(item, index),
      order: index,
    }));

  if (remainingItems.length === (list.items || []).length) {
    throw new NotFoundError('Ese manga no existe dentro de la lista.');
  }

  return listRepository.updateById(list._id, {
    items: remainingItems,
  });
};

const reorderListItems = async (listId, userId, payload = {}) => {
  const list = await getListOrThrow(listId);
  ensureListOwner(list, userId);

  const requestedItems = Array.isArray(payload.items) ? payload.items : [];

  if (!requestedItems.length) {
    throw new BadRequestError('Debes enviar un arreglo de items para reordenar.');
  }

  const currentItemsByMangaId = new Map(
    (list.items || []).map((item, index) => [getListMangaId(item), normalizeExistingListItem(item, index)]),
  );

  if (requestedItems.length !== currentItemsByMangaId.size) {
    throw new BadRequestError('Debes enviar todos los mangas de la lista para reordenar.');
  }

  const nextItems = requestedItems.map((item, index) => {
    const currentItem = currentItemsByMangaId.get(item.mangaId);

    if (!currentItem) {
      throw new BadRequestError('La lista de reordenamiento contiene mangas invalidos.');
    }

    return {
      ...currentItem,
      order: index,
    };
  });

  return listRepository.updateById(list._id, {
    items: nextItems,
  });
};

const getUserLists = async (username, currentUser = null) => {
  const user = await userRepository.findByUsername(username);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  const isOwner = currentUser?.id === user._id.toString();
  const lists = await listRepository.findByOwnerId(
    user._id,
    isOwner ? {} : { visibility: 'public' },
    {
      sort: { updatedAt: -1, createdAt: -1 },
    },
  );

  return {
    user: sanitizePublicUser(user),
    items: lists,
  };
};

const getUserListByUsername = async (username, listId, currentUser = null) => {
  const user = await userRepository.findByUsername(username);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  const list = await getListOrThrow(listId);

  if (list.owner?._id?.toString() !== user._id.toString()) {
    throw new NotFoundError('Lista no encontrada.');
  }

  ensureListAccess(list, currentUser);

  return {
    user: sanitizePublicUser(user),
    list,
  };
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
  ensureDefaultLists,
};
