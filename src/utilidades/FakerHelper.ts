import type { Faker } from "@faker-js/faker";

let fakerInstance: Faker | undefined;

/**
 * Asynchronously loads and returns the faker instance.
 * @returns Promise<Faker>
 */
export async function getFaker(): Promise<Faker> {
    if (!fakerInstance) {
        const { faker } = await import("@faker-js/faker");
        fakerInstance = faker;
    }
    return fakerInstance;
}
