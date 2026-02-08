import { getAllCountries, getAllCountriesInCode } from "$lib/server/fetching";
import { error, json, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ params }) => {
    let countries;
    if (params?.code) {
        const codeNum = Number(params.code);
        if (isNaN(codeNum)) {
            return error(400, "Passed invalid number");
        }
        countries = getAllCountriesInCode(codeNum);
    } else {
        countries = getAllCountries();
    }
    return json(await countries);
};
