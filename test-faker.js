const fakerPromise = import('@faker-js/faker');
fakerPromise.then(m => {
    console.log("Faker loaded successfully");
    console.log(m.fakerES_MX.person.firstName());
}).catch(e => {
    console.error("Faker failed to load");
    console.error(e);
});
