import expect from 'expect.js';

export default function ({ getService, getPageObjects }) {
  const dashboardExpect = getService('dashboardExpect');
  const dashboardAddPanel = getService('dashboardAddPanel');
  const testSubjects = getService('testSubjects');
  const filterBar = getService('filterBar');
  const PageObjects = getPageObjects(['dashboard', 'header', 'visualize']);

  describe('dashboard filter bar', async () => {
    before(async () => {
      await PageObjects.dashboard.gotoDashboardLandingPage();
    });

    describe('Add a filter bar', async function () {
      before(async () => {
        await PageObjects.dashboard.gotoDashboardLandingPage();
      });

      it('should show on an empty dashboard', async function () {
        await PageObjects.dashboard.clickNewDashboard();
        const hasAddFilter = await testSubjects.exists('addFilter');
        expect(hasAddFilter).to.be(true);
      });

      it ('should continue to show for visualizations with no search source', async () => {
        await dashboardAddPanel.addVisualization('input control');
        const hasAddFilter = await testSubjects.exists('addFilter');
        expect(hasAddFilter).to.be(true);
      });
    });

    describe('filter editor field list', async () => {
      before(async () => {
        await PageObjects.dashboard.gotoDashboardLandingPage();
        await PageObjects.dashboard.clickNewDashboard();
      });

      it('uses default index pattern on an empty dashboard', async () => {
        await testSubjects.click('addFilter');
        await dashboardExpect.fieldSuggestionIndexPatterns(['logstash-*']);
      });

      it('shows index pattern of vis when one is added', async () => {
        await dashboardAddPanel.addVisualization('animal sounds pie');
        await PageObjects.header.waitUntilLoadingHasFinished();
        await filterBar.ensureFieldEditorModalIsClosed();
        await testSubjects.click('addFilter');
        await dashboardExpect.fieldSuggestionIndexPatterns(['animals-*']);
      });

      it('works when a vis with no index pattern is added', async () => {
        await dashboardAddPanel.addVisualization('markdown');
        await PageObjects.header.waitUntilLoadingHasFinished();
        await filterBar.ensureFieldEditorModalIsClosed();
        await testSubjects.click('addFilter');
        await dashboardExpect.fieldSuggestionIndexPatterns(['animals-*']);
      });
    });

    describe('filter pills', async function () {
      before(async () => {
        await PageObjects.dashboard.gotoDashboardLandingPage();
        await PageObjects.dashboard.clickNewDashboard();
        await PageObjects.dashboard.setTimepickerIn63DataRange();
      });

      it('are not selected by default', async function () {
        const filters = await PageObjects.dashboard.getFilters(1000);
        expect(filters.length).to.equal(0);
      });

      it('are added when a pie chart slice is clicked', async function () {
        await dashboardAddPanel.addVisualization('Rendering Test: pie');
        await PageObjects.dashboard.waitForRenderComplete();
        await PageObjects.dashboard.filterOnPieSlice('4,886');
        const filters = await PageObjects.dashboard.getFilters();
        expect(filters.length).to.equal(1);

        await dashboardExpect.pieSliceCount(1);
      });

      it('are preserved after saving a dashboard', async () => {
        await PageObjects.dashboard.saveDashboard('with filters');
        await PageObjects.header.waitUntilLoadingHasFinished();

        const filters = await PageObjects.dashboard.getFilters();
        expect(filters.length).to.equal(1);

        await dashboardExpect.pieSliceCount(1);
      });

      it('are preserved after opening a dashboard saved with filters', async () => {
        await PageObjects.dashboard.gotoDashboardLandingPage();
        await PageObjects.dashboard.loadSavedDashboard('with filters');
        await PageObjects.header.waitUntilLoadingHasFinished();

        const filters = await PageObjects.dashboard.getFilters();
        expect(filters.length).to.equal(1);

        await dashboardExpect.pieSliceCount(1);
      });
    });
  });
}
