/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Redis from 'ioredis';
import { In } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { UsersRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';

const userUnreadPrefix = 'newChatMessagesExists:';
const userMarkerPrefix = 'newUserChatMessageExists:';

export const meta = {
	tags: ['admin'],
	description: 'Remove unread chat markers for deleted or missing users.',

	requireCredential: true,
	requireModerator: true,
	kind: 'write:admin:account',

	res: {
		type: 'object',
		optional: false, nullable: false,
		properties: {
			cleaned: { type: 'number', optional: false, nullable: false },
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.redis)
		private redisClient: Redis.Redis,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,
	) {
		super(meta, paramDef, async () => {
			let cursor = '0';
			let cleaned = 0;
			const redisPrefix = this.config.redis.prefix + ':';

			do {
				const [nextCursor, keys] = await this.redisClient.scan(cursor, 'MATCH', redisPrefix + userUnreadPrefix + '*', 'COUNT', 100);
				cursor = nextCursor;

				for (const key of keys) {
					const redisKey = key.slice(redisPrefix.length);
					const members = await this.redisClient.smembers(redisKey);
					const senderIds = members
						.filter(member => member.startsWith('user:'))
						.map(member => member.slice('user:'.length));

					if (senderIds.length === 0) continue;

					const liveUsers = await this.usersRepository.find({
						where: {
							id: In(senderIds),
							isDeleted: false,
						},
						select: {
							id: true,
						},
					});
					const liveSenderIds = new Set(liveUsers.map(user => user.id));

					const recipientId = redisKey.slice(userUnreadPrefix.length);
					const redisPipeline = this.redisClient.pipeline();

					for (const senderId of senderIds) {
						if (liveSenderIds.has(senderId)) continue;

						redisPipeline.srem(redisKey, 'user:' + senderId);
						redisPipeline.del(userMarkerPrefix + recipientId + ':' + senderId);
						cleaned++;
					}

					if (redisPipeline.length > 0) {
						await redisPipeline.exec();
					}
				}
			} while (cursor !== '0');

			return { cleaned };
		});
	}
}
