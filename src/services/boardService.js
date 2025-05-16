import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
import { slugify } from '~/utils/formatters'

const createNew = async (userId, reqBody) => {

  // eslint-disable-next-line no-useless-catch
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    const createdBoard = await boardModel.createNew(userId, newBoard)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    return getNewBoard
  } catch (error) {
    throw error
  }
}


const getDetails = async (userId, boardId) => {
  try {
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    const resBoard = cloneDeep(board)

    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })

    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {

  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardToDifferentColumn = async (reqBody) => {

  try {
  // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updateAt: Date.now()
    })
    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (thêm _id vào Card của mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updateAt: Date.now()
    })
    // B3: Cập nhật lại trường ColumnId mới của cái Card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })
    return { updateResult: 'Successfully!' }

  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {

  try {
    // nếu không tồn tại page hoặc itemsPerPage từ phía FE thì BE sẽ cần phải luôn gán giá trị mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const result = await boardModel.getBoards(userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilters
    )

    return result
  } catch (error) {
    throw error
  }
}

const deleteItem = async (boardId) => {

  try {
    const targetBoard = await boardModel.findOneById(boardId)
    if (!targetBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    await boardModel.deleteOneById(boardId)

    await columnModel.deleteManyByBoardId(boardId)

    await cardModel.deleteManyByColumnId(boardId)


    return { deleteResult: 'Board and its Columns deleted successfully!' }
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
  deleteItem
}