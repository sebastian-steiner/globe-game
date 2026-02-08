import { getAllRegions } from "$lib/server/fetching";
import { json, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async () => {
    return json(await getAllRegions());
};
