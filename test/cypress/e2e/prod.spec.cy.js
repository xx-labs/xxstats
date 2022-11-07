const baseUrl = 'https://xx.polkastats.io';

const blockNumber = 100000;
const account = '6XmmXY7v7NeGH3qiiZTQCRsp2bV3m5zNKAgohiNPE8uiprJ7';
const transferHash = '0xd8ec08677fb56d4352c4bd3b686c02818dbf562d2687667061bb704c95a8ae9b';
const validator = '6ZjtGawffFWrRttNBvYWmHv1Teg1Sa4twzmt8yPMDEkf7Ygr';
const extrinsicHash = '0xcd3f5ca6741c7212db281e8578f83bc9ea930979378a2a7564dd1952464401d0';
const eventId = '4808812/0';

describe(`xxstats-prod -> ${baseUrl}`, () => {

  it('successfully loads home page', () => {
    cy.visit(baseUrl);

    // last blocks table should have 10 rows
    cy.get('.last-blocks .table-responsive .table tbody')
      .find('tr')
      .then((row) => {
        cy.log(`number of rows: ${row.length}`);
        expect(row.length).to.equal(10)
      });
    // last transfers table should have 10 rows
    cy.get('.last-transfers .table-responsive .table tbody')
      .find('tr')
      .then((row) => {
        cy.log(`number of rows: ${row.length}`);
        expect(row.length).to.equal(10)
      });
    // last extrinsics table should have 10 rows
    cy.get('.last-extrinsics .table-responsive .table tbody')
      .find('tr')
      .then((row) => {
        cy.log(`number of rows: ${row.length}`);
        expect(row.length).to.equal(10)
      });
    // last events table should have 10 rows
    cy.get('.last-events .table-responsive .table tbody')
      .find('tr')
      .then((row) => {
        cy.log(`number of rows: ${row.length}`);
        expect(row.length).to.equal(10)
      });
    // whale alert table should have 10 rows
    cy.get('.whale-alert .table-responsive .table tbody')
      .find('tr')
      .then((row) => {
        expect(row.length).to.equal(10)
      });
  });

  it(`successfully loads accounts page`, () => {
    cy.visit(`${baseUrl}/accounts`);
    // accounts table should have 10 rows
    cy.get('.page-accounts #accounts-table tbody')
      .find('tr[role=row]')
      .then((row) => {
        cy.log(row)
        expect(row.length).to.equal(10)
      });
  });

  it(`successfully loads account ${account} page`, () => {
    cy.visit(`${baseUrl}/account/${account}`);
    cy.get('.page-account h4').should('contain', '6XmmX…iprJ7');
  });

  it(`successfully loads transfers page`, () => {
    cy.visit(`${baseUrl}/transfers`);
    // transfers table should have 10 rows
    cy.get('.page-transfers .table-responsive .table tbody')
      .find('tr[role=row]')
      .then((row) => {
        cy.log(row)
        expect(row.length).to.equal(10)
      });
  });

  it(`successfully load transfer ${transferHash} page`, () => {
    cy.visit(`${baseUrl}/transfer/${transferHash}`);
    cy.get('.page-transfer h4').should('contain', 'Transfer 0xd8ec…ae9b')
  });

  it('successfully loads staking dashboard page', () => {
    cy.visit(`${baseUrl}/staking/dashboard`);
  });

  it('successfully loads staking validators page', () => {
    cy.visit(`${baseUrl}/staking/validators`);
    // validator ranking table should have 10 rows
    cy.get('.page-validators.ranking .table tbody')
      .find('tr')
      .then((row) => {
        expect(row.length).to.equal(10)
      });
  });

  it(`successfully loads validator ${validator} page`, () => {
    cy.visit(`${baseUrl}/validator/${validator}`);
    cy.get('.page-validator h1 span').should('contain', 'Hotchick');
  });

  it(`successfully loads blocks page`, () => {
    cy.visit(`${baseUrl}/blocks`);
    // blocks table should have 10 rows
    cy.get('.page-blocks .last-blocks .table tbody')
      .find('tr')
      .then((row) => {
        expect(row.length).to.equal(10)
      });
  });

  it(`successfully loads extrinsics page`, () => {
    cy.visit(`${baseUrl}/extrinsics`);
    // extrinsics table should have 10 rows
    cy.get('.page-extrinsics .table tbody')
      .find('tr')
      .then((row) => {
        expect(row.length).to.equal(10)
      });
  });

  it(`successfully loads events page`, () => {
    cy.visit(`${baseUrl}/events`);
    // events table should have 10 rows
    cy.get('.page-events .table tbody')
      .find('tr')
      .then((row) => {
        expect(row.length).to.equal(10)
      });
  });

  it(`successfully loads block #${blockNumber} page`, () => {
    cy.visit(`${baseUrl}/block?blockNumber=${blockNumber}`);
    cy.get('.page-block h4').should('contain', 'block #100,000');
  });

  it(`successfully loads extrinsic ${extrinsicHash} page`, () => {
    cy.visit(`${baseUrl}/extrinsic/${extrinsicHash}`);
    cy.get('.page-extrinsic h4').should('contain', 'Extrinsic').should('contain', '4809391-0');
  });

  it(`successfully loads event ${eventId} page`, () => {
    cy.visit(`${baseUrl}/event/${eventId}`);
    cy.get('.page-event h4').should('contain', 'Event 4808812-0');
  });

});