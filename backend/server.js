export default {
  data() {
    return {
      currentPage: 'home',
      searchQuery: '',
      countryInfo: null,
      countries: [
        { name: 'France', capital: 'Paris', population: '67 million', languages: ['French'], timezone: 'CET (UTC+1)' },
        { name: 'Germany', capital: 'Berlin', population: '83 million', languages: ['German'], timezone: 'CET (UTC+1)' },
        { name: 'Spain', capital: 'Madrid', population: '47 million', languages: ['Spanish'], timezone: 'CET (UTC+1)' },
        { name: 'Italy', capital: 'Rome', population: '60 million', languages: ['Italian'], timezone: 'CET (UTC+1)' },
        { name: 'Portugal', capital: 'Lisbon', population: '10 million', languages: ['Portuguese'], timezone: 'WET (UTC+0)' }
      ],
      filteredCountries: []
    };
  },
  methods: {
    navigate(page) {
      this.currentPage = page;
    },
    filterCountries() {
      const query = this.searchQuery.toLowerCase();
      this.filteredCountries = this.countries.filter(country =>
        country.name.toLowerCase().startsWith(query)
      );
    },
    selectCountry(countryName) {
      this.searchQuery = countryName;
      this.filteredCountries = [];
      this.searchCountry();
    },
    searchCountry() {
      this.countryInfo = this.countries.find(country =>
        country.name.toLowerCase() === this.searchQuery.trim().toLowerCase()
      );
    }
  }
};