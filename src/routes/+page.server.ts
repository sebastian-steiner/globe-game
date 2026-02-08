import { getAllCountries } from "$lib/server/fetching";

export async function load() {
    console.log(await getAllCountries());
}
