const baseUrl = 'http://localhost:3000';

const blockNumber = 100000;
const account = '6XmmXY7v7NeGH3qiiZTQCRsp2bV3m5zNKAgohiNPE8uiprJ7';
const transferHash = '0xd8ec08677fb56d4352c4bd3b686c02818dbf562d2687667061bb704c95a8ae9b';
const validator = '6ZjtGawffFWrRttNBvYWmHv1Teg1Sa4twzmt8yPMDEkf7Ygr';
const extrinsicHash = '0xcd3f5ca6741c7212db281e8578f83bc9ea930979378a2a7564dd1952464401d0';
const eventId = '4808812/0';

describe('xxstats-local', () => {

  it('successfully loads home page', () => {
    cy.visit(baseUrl);

    // check home tables
    cy.get('.last-blocks .table-responsive .table tbody')
    .find('tr')
    .then((row) => {
      cy.log(`number of rows: ${row.length}`);
      expect(row.length).to.equal(10)
    });
    cy.get('.last-transfers .table-responsive .table tbody')
    .find('tr')
    .then((row) => {
      cy.log(`number of rows: ${row.length}`);
      expect(row.length).to.equal(10)
    });
    cy.get('.last-extrinsics .table-responsive .table tbody')
    .find('tr')
    .then((row) => {
      cy.log(`number of rows: ${row.length}`);
      expect(row.length).to.equal(10)
    });
    cy.get('.last-events .table-responsive .table tbody')
    .find('tr')
    .then((row) => {
      cy.log(`number of rows: ${row.length}`);
      expect(row.length).to.equal(10)
    });
    cy.get('.whale-alert .table-responsive .table tbody')
    .find('tr')
    .then((row) => {
      expect(row.length).to.equal(10)
    });
  });

  it(`successfully loads account ${account} page`, () => {
    cy.visit(`${baseUrl}/account/${account}`);
    cy.get('h4').should('contain', '6XmmX…iprJ7');
  });

  it(`successfully load transfer ${transferHash} page`, () => {
    cy.visit(`${baseUrl}/transfer/${transferHash}`);
    cy.get('h4').should('contain', 'Transfer 0xd8ec…ae9b')
  });

  it('successfully loads staking dashboard page', () => {
    cy.visit(`${baseUrl}/staking/dashboard`);
  });

  it('successfully loads staking validators page', () => {
    cy.visit(`${baseUrl}/staking/validators`);
    cy.get('.ranking .table tbody')
    .find('tr')
    .then((row) => {
      expect(row.length).to.equal(10)
    });
  });

  it(`successfully loads validator ${validator} page`, () => {
    cy.visit(`${baseUrl}/validator/${validator}`);
    cy.get('h1 span').should('contain', 'Hotchick');
  });

  it(`successfully loads block #${blockNumber} page`, () => {
    cy.visit(`${baseUrl}/block?blockNumber=${blockNumber}`);
    cy.get('h4').should('contain', 'block #100,000');
  });

  it(`successfully loads extrinsic ${extrinsicHash} page`, () => {
    cy.visit(`${baseUrl}/extrinsic/${extrinsicHash}`);
    cy.get('h4').should('contain', 'Extrinsic').should('contain', '4809391-0');
  });

  it(`successfully loads event ${eventId} page`, () => {
    cy.visit(`${baseUrl}/event/${eventId}`);
    cy.get('h4').should('contain', 'Event 4808812-0');
  });

});