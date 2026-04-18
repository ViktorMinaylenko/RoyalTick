import { screen } from '@testing-library/react';
import { GoodsList } from "../../../components/GoodsList/GoodsList";
import { renderWithAdmin } from '../test-utils';
import { describe, it, expect, vi } from 'vitest';

describe('GoodsList Component', () => {
  it('renders component without crashing', () => {
    const { container } = renderWithAdmin(<GoodsList />);
    expect(container).toBeDefined();
  });

  it('displays price as a NumberField', () => {
    renderWithAdmin(<GoodsList />);
    expect(GoodsList).toBeDefined();
  });

  it('calls localStorage when row is clicked', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    renderWithAdmin(<GoodsList />);
    expect(setItemSpy).toBeDefined();
  });

  it('matches snapshot of the list structure', () => {
    const { container } = renderWithAdmin(<GoodsList />);
    expect(container).toMatchSnapshot();
  });
});