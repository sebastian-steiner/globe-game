import { pgTable, serial, integer, text, boolean } from 'drizzle-orm/pg-core';

export const country = pgTable('countries', {
	gid: serial('gid').primaryKey(),
	code: text('code').notNull(),
	type: text('shapetype').notNull(),
	name: text('shapename').notNull(),
	region: text('region'),
	regionCode: integer('regioncode'),
	subregion: text('subregion'),
	subregionCode: integer('subregioncode'),
	island: boolean('islandstate')
});