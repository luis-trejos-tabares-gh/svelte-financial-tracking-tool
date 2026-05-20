import { transaction } from '$lib/server/db/schema';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, locals }) {
    // This code only runs on the server
    const res = await fetch('/transaction', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }); 

    const data =  await res.json();

    return {
        transactions: data
    };
}
