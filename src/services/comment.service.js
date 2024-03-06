"use strict";

const { NotFoundError } = require("../core/error.response");
const commentModel = require("../models/comment.model");
const { findProduct } = require("../models/repository/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null
  }) {
    const comment = new commentModel({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId
    });

    let rightValue;
    if (parentCommentId) {
      //reply comment
      const parentComment = commentModel.findOne(parentCommentId);
      if (!parentComment) throw new NotFoundError(`parent comment not found`);

      rightValue = parentComment.comment_right;

      //updateMany comment
      await commentModel.findOneAndUpdate(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_right: {
            $gte: rightValue
          }
        },
        { $inc: { comment_right: 2 } }
      );

      await commentModel.findOneAndUpdate(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: {
            $gte: rightValue
          }
        },
        { $inc: { comment_left: 2 } }
      );
    } else {
      const maxRightValue = commentModel.findOne(
        { comment_productId: convertToObjectIdMongodb(productId) },
        "comment_right",
        { sort: { comment_right: -1 } }
      );
      if (maxRightValue) {
        rightValue = maxRightValue.right + 1;
      } else {
        rightValue = 1;
      }
    }
    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;
    await comment.save();
    return comment;
  }

  static async getCommentsByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0
  }) {
    if (parentCommentId) {
      const parent = await commentModel.findById(parentCommentId);
      if (!parent)
        throw new NotFoundError(`Not found parent comment for product`);
      const comments = commentModel
        .find({
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: { $gt: parent.comment_left },
          comment_right: { $lt: parent.comment_right }
        })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_parentId: 1
        })
        .sort({ comment_left: 1 });
      return comments;
    }

    const comments = commentModel
      .find({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_parentId: parentCommentId
      })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_parentId: 1
      })
      .sort({ comment_left: 1 });
    return comments;
  }

  static async deleteComments({ commentId, productId }) {
    // check products exist
    const foundProduct = await findProduct({ product_id: productId });
    if (!foundProduct) throw new NotFoundError(`Product not found`);

    //xac dinh left right cua commenId
    const comment = await commentModel.findById(commentId);
    if (!comment) throw new NotFoundError(`Comment not found`);

    const leftValue = comment.comment_left;
    const rightValue = comment.comment_right;

    // tim width
    const width = rightValue - leftValue + 1;
    //Xoa cac comment con
    await commentModel.deleteMany({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: { $gt: leftValue, $lt: rightValue }
    });

    // Cap nhat gia tri left right con lai
    await commentModel.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_right: { $gt: rightValue }
      },
      {
        $inc: {
          comment_right: -width
        }
      }
    );

    await commentModel.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: leftValue }
      },
      {
        $inc: {
          comment_left: -width
        }
      }
    );
  }
}

module.exports = CommentService;
