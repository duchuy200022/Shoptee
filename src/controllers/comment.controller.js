"user strict";

const { SuccessResponse } = require("../core/success.response");
const {
  createComment,
  getCommentsByParentId,
  deleteComments
} = require("../services/comment.service");

class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: "create new comment",
      metadata: await createComment(req.body)
    }).send(res);
  };

  getCommentsByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: "get comments success",
      metadata: await getCommentsByParentId(req.query)
    }).send(res);
  };

  deleteComment = async (req, res, next) => {
    new SuccessResponse({
      message: "delete comments success",
      metadata: await deleteComments(req.body)
    }).send(res);
  };
}

module.exports = new CommentController();
