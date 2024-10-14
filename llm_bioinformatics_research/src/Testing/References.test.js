import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import References from '../References/References';

describe('References Component', () => {
  it('renders without crashing', () => {
    render(<References />);
    expect(screen.getByText('References')).toBeInTheDocument();
  });

  it('displays all references initially', () => {
    render(<References />);
  
    const bioinformaticsTitles = screen.getAllByText('Understanding Bioinformatics');
    expect(bioinformaticsTitles.length).toBeGreaterThan(0);

    const genomicsTitles = screen.getAllByText('Advanced Techniques in Genomics');
    expect(genomicsTitles.length).toBeGreaterThan(0);
  });

  it('filters references based on search input', () => {
    render(<References />);
  
    const searchInput = screen.getByLabelText('Search References');
    fireEvent.change(searchInput, { target: { value: 'Smith' } });

    const bioinformaticsTitles = screen.getAllByText('Understanding Bioinformatics');
    expect(bioinformaticsTitles[0]).toBeInTheDocument();  
  
    expect(screen.queryByText('Advanced Techniques in Genomics')).not.toBeInTheDocument();
  });
  

  it('shows "No references found" when no references match the search input', () => {
    render(<References />);

    const searchInput = screen.getByLabelText('Search References');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Author' } });

    expect(screen.getByText('No references found')).toBeInTheDocument();
  });

  it('expands Accordion to show full citation details', () => {
    render(<References />);

    const hiddenCitation = screen.getByText((content, element) => content.includes('Bioinformatics Journal, 15, 123-130'));
    expect(hiddenCitation).not.toBeVisible(); 

    const firstAccordion = screen.getByRole('button', { name: /Understanding Bioinformatics/i });
    fireEvent.click(firstAccordion);

    expect(screen.getByText((content, element) => content.includes('Bioinformatics Journal, 15, 123-130'))).toBeVisible();
  });
  
});
