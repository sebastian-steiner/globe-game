import { page } from 'vitest/browser';
import { describe, expect, it, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SettingsPage from './+page.svelte';

describe('/settings/+page.svelte', () => {
  beforeEach(() => {
    // Clear persisted settings before each test
    localStorage.removeItem('globe-game-settings');
  });

  it('should render the settings heading', async () => {
    render(SettingsPage);
    const heading = page.getByRole('heading', { level: 1 });
    await expect.element(heading).toHaveTextContent('Settings');
  });

  it('should render all setting toggles', async () => {
    render(SettingsPage);
    await expect.element(page.getByTestId('toggle-show-scale')).toBeInTheDocument();
    await expect.element(page.getByTestId('toggle-show-all-countries')).toBeInTheDocument();
    await expect.element(page.getByTestId('toggle-limit-reveal-zoom')).toBeInTheDocument();
  });

  it('should render setting labels', async () => {
    render(SettingsPage);
    await expect.element(page.getByText('Show scale')).toBeInTheDocument();
    await expect.element(page.getByText('Show all countries')).toBeInTheDocument();
    await expect.element(page.getByText('Zoom out on reveal')).toBeInTheDocument();
  });

  it('should render setting descriptions', async () => {
    render(SettingsPage);
    await expect
      .element(page.getByText('Display the map scale control on the globe'))
      .toBeInTheDocument();
    await expect
      .element(
        page.getByText('Always show every country on the globe behind the highlighted one'),
      )
      .toBeInTheDocument();
    await expect
      .element(
        page.getByText('Zoom out to show surrounding countries when revealing the solution'),
      )
      .toBeInTheDocument();
  });

  it('should have correct default states (showScale on, showAll off, limitRevealZoom off)', async () => {
    render(SettingsPage);

    const showScale = page.getByTestId('toggle-show-scale');
    const showAll = page.getByTestId('toggle-show-all-countries');
    const limitRevealZoom = page.getByTestId('toggle-limit-reveal-zoom');

    await expect.element(showScale).toBeChecked();
    await expect.element(showAll).not.toBeChecked();
    await expect.element(limitRevealZoom).not.toBeChecked();
  });

  it('should toggle limit reveal zoom on click', async () => {
    render(SettingsPage);
    const toggle = page.getByTestId('toggle-limit-reveal-zoom');
    await expect.element(toggle).not.toBeChecked();

    await toggle.click();
    await expect.element(toggle).toBeChecked();

    await toggle.click();
    await expect.element(toggle).not.toBeChecked();
  });

  it('should render a back link to home', async () => {
    render(SettingsPage);
    const backLink = page.getByTestId('back-link');
    await expect.element(backLink).toBeInTheDocument();
    await expect.element(backLink).toHaveTextContent('← Back');
  });

  it('should render the Reset to defaults button', async () => {
    render(SettingsPage);
    const resetBtn = page.getByTestId('btn-reset-settings');
    await expect.element(resetBtn).toBeInTheDocument();
    await expect.element(resetBtn).toHaveTextContent('Reset to defaults');
  });

  it('should reset toggles to defaults when reset button is clicked', async () => {
    render(SettingsPage);

    // Toggle all to non-default
    await page.getByTestId('toggle-show-scale').click();
    await page.getByTestId('toggle-show-all-countries').click();
    await page.getByTestId('toggle-limit-reveal-zoom').click();

    await expect.element(page.getByTestId('toggle-show-scale')).not.toBeChecked();
    await expect.element(page.getByTestId('toggle-show-all-countries')).toBeChecked();
    await expect.element(page.getByTestId('toggle-limit-reveal-zoom')).toBeChecked();

    // Click reset
    await page.getByTestId('btn-reset-settings').click();

    // Should be back to defaults
    await expect.element(page.getByTestId('toggle-show-scale')).toBeChecked();
    await expect.element(page.getByTestId('toggle-show-all-countries')).not.toBeChecked();
    await expect.element(page.getByTestId('toggle-limit-reveal-zoom')).not.toBeChecked();
  });
});
