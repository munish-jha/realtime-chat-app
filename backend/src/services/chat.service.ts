import mongoose from "mongoose";
import ChatModel from "../models/chat.model";
import UserModel from "../models/user.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import MessageModel from "../models/message.model";

export const createChatService = async (
  userId: string,
  body: {
    participantId?: string;
    isGroup?: boolean;
    participants?: string[];
    groupName?: string;
  }
) => {
  const { participantId, isGroup, participants, groupName } = body;
  let chat;
  let allParticipantIds: mongoose.Types.ObjectId[] = [];

  if (isGroup && participants?.length && groupName) {
    allParticipantIds = [userId, ...participants].map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    chat = await ChatModel.create({
      participants: allParticipantIds,
      isGroup: true,
      groupName,
      createdBy: userId,
    });
  } else if (participantId) {
    const otherUser = await UserModel.findById(participantId);
    if (!otherUser) throw new NotFoundException("User not found");

    allParticipantIds = [userId, participantId].map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const existingChat = await ChatModel.findOne({
      participants: {
        $all: allParticipantIds,
        $size: 2,
      },
    }).populate("participants", "name avatar");

    if (existingChat) return existingChat;

    chat = await ChatModel.create({
      participants: allParticipantIds,
      isGroup: false,
      createdBy: userId,
    });
  }

  // TODO: Implement websocket

  return chat;
};

export const getUserChatsService = async (userId: string) => {
  const chats = await ChatModel.find({
    participants: {
      $in: [userId],
    },
  })
    .populate("participants", "name avatar")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .sort({ updatedAt: -1 });

  return chats;
};

export const getSingleChatService = async (chatId: string, userId: string) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });

  if (!chat)
    throw new BadRequestException(
      "Chat not found  or you are not authorized to view this chat"
    );

  const messages = await MessageModel.find({ chatId })
    .populate("sender", "name avatar")
    .populate({
      path: "replyTo",
      select: "content image sender",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .sort({ createdAt: 1 });

  return {
    chat,
    messages,
  };
};
