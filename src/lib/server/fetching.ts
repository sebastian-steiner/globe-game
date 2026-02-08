import type { Country, Region, Subregion } from '$lib/data';
import { and, eq, or } from 'drizzle-orm';
import { country, db } from './db';

export async function getAllCountries(): Promise<Country[]> {
    return await db.select({
        id: country.gid,
        code: country.code,
        name: country.name
    }).from(country)
    .where(eq(country.type, 'ADM0'));
}

export async function getAllCountriesInCode(regionCode: number): Promise<Country[]> {
    return await db.select({
        id: country.gid,
        code: country.code,
        name: country.name
    }).from(country)
    .where(and(or(eq(country.regionCode, regionCode), eq(country.subregionCode, regionCode)), eq(country.type, 'ADM0')));
}

export async function getAllRegions(): Promise<Region[]> {
    const countryList = await db.query.country.findMany({
        with: {
            region: true,
            regionCode: true
        },
        columns: {
            regionCode: true,
            region: true
        }
    });
    return countryList.map(c => ({ name: c.region, code: c.regionCode }));
}

export async function getAllSubregions(): Promise<Subregion[]> {
    const countryList = await db.query.country.findMany({
        with: {
            subregion: true,
            subregionCode: true
        },
        columns: {
            subregionCode: true,
            subregion: true
        }
    });
    return countryList.map(c => ({ name: c.subregion, code: c.subregionCode }));
}
