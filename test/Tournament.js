const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Tournament", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTournamentFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2, account3, account4] =
      await ethers.getSigners();

    const Tournament = await ethers.getContractFactory("Tournament");
    const tournament = await Tournament.deploy(owner.address);

    return { tournament, owner, account1, account2, account3, account4 };
  }

  describe("Deployment", function () {
    it("Should set the organiser", async function () {
      const { tournament, owner } = await loadFixture(deployTournamentFixture);

      expect(await tournament.ORGANISER()).to.equal(owner.address);
    });
  });

  describe("Create", function () {
    it("Should create a tournament", async function () {
      const { tournament, owner } = await loadFixture(deployTournamentFixture);
      const MAX_PLAYERS = 5;
      expect(await tournament.connect(owner).createTournament(MAX_PLAYERS))
        .to.emit(tournament, "TournamentCreated")
        .withArgs(0, owner.address, MAX_PLAYERS);
    });
    it("Only Organiser is able to create tournaments", async function () {
      const { tournament, account1 } = await loadFixture(
        deployTournamentFixture
      );
      const MAX_PLAYERS = 5;
      await expect(
        tournament.connect(account1).createTournament(MAX_PLAYERS)
      ).to.be.revertedWith("Only organiser can call this function");
    });
  });
  describe("Join", function () {
    it("Should join a tournament", async function () {
      const { tournament, owner, account1 } = await loadFixture(
        deployTournamentFixture
      );
      const MAX_PLAYERS = 5;
      await tournament.connect(owner).createTournament(MAX_PLAYERS);
      expect(await tournament.connect(account1).joinTournament(0))
        .to.emit(tournament, "TournamentJoined")
        .withArgs(0, account1.address);
    });
    it("Should start the tournament once MAX_PLAYERS joined", async function () {
      const { tournament, owner, account1, account2, account3 } =
        await loadFixture(deployTournamentFixture);
      const MAX_PLAYERS = 3;
      await tournament.connect(owner).createTournament(MAX_PLAYERS);
      await tournament.connect(account1).joinTournament(0);
      await tournament.connect(account2).joinTournament(0);
      expect(await tournament.connect(account3).joinTournament(0))
        .to.emit(tournament, "TournamentStarted")
        .withArgs(0);
    });
    it("Cannot join after tournament has started", async function () {
      const { tournament,owner, account1,account2,account3,account4 } = await loadFixture(
        deployTournamentFixture
      );
      const MAX_PLAYERS = 3;
      await tournament.connect(owner).createTournament(MAX_PLAYERS);
      await tournament.connect(account1).joinTournament(0);
      await tournament.connect(account2).joinTournament(0);
      await tournament.connect(account3).joinTournament(0);
      await expect(
        tournament.connect(account4).joinTournament(0)
      ).to.be.revertedWith("Tournament is not available to join");
    });
  });
  describe("End", function () {
    it("Should end a tournament", async function () {
      const { tournament, owner, account1, account2, account3 } =
        await loadFixture(deployTournamentFixture);
      const MAX_PLAYERS = 3;
      await tournament.connect(owner).createTournament(MAX_PLAYERS);
      await tournament.connect(account1).joinTournament(0);
      await tournament.connect(account2).joinTournament(0);
      await tournament.connect(account3).joinTournament(0);
      expect(
        await tournament
          .connect(owner)
          .endTournament(
            0,
            [account1.address, account2.address, account3.address],
            [4, 7, 2]
          )
      )
        .to.emit(tournament, "TournamentEnded")
        .withArgs(0);
    });
    it("Only organiser can end the tournament", async function () {
      const { tournament, owner, account1, account2, account3 } =
        await loadFixture(deployTournamentFixture);
      const MAX_PLAYERS = 3;
      await tournament.connect(owner).createTournament(MAX_PLAYERS);
      await tournament.connect(account1).joinTournament(0);
      await tournament.connect(account2).joinTournament(0);
      await tournament.connect(account3).joinTournament(0);
      await expect(
        tournament
          .connect(account1)
          .endTournament(
            0,
            [account1.address, account2.address, account3.address],
            [4, 7, 2]
          )
      )
        .to.be.revertedWith("Only organiser can call this function");
    });
  });
});
