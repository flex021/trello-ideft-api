const { StatusCodes } = require('http-status-codes')
const Joi = require('joi')
const { default: ApiError } = require('~/utils/ApiError')


const createNewBoardInvitation = async (req, res, next) => {
  const correctConditon = Joi.object({
    inviteeEmail: Joi.string().required(),
    boardId: Joi.string().required()
  })
  try {
    await correctConditon.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const invitationValidation = {
  createNewBoardInvitation
}