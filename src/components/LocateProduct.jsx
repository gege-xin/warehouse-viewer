import SearchResultList from './SearchResultList.jsx';

function LocateProduct({ largeText, results, searchTerm, selectedCode, onLocate }) {
  return (
    <SearchResultList
      largeText={largeText}
      results={results}
      searchTerm={searchTerm}
      selectedCode={selectedCode}
      onLocate={onLocate}
    />
  );
}

export default LocateProduct;
