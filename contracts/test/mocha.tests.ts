describe ('promises in mocha', () => {

    it('first promise', () => {
        let myP = new Promise((res, rej) => {
            res();
            setTimeout(() => {
                rej(new Error('timeout'));
            }, 1000)
        })
    })

    //How to use even listener but takes a long time!
    it('deploys a club and checks admin address', async () => {
        const {deployer, wallet} = await loadFixture(fixture);
        let tx = await deployer.deploy();
        await tx.wait();
        let deployEvent = new Promise((resolve) => {
            deployer.once("NewClub", (_admin, _clubAddress) => {
                resolve({
                    admin: _admin,
                    clubAddress: _clubAddress
                })
            });
        });
        let event: any = await deployEvent;
        expect(event.admin).to.equal(wallet.address);
    });

})