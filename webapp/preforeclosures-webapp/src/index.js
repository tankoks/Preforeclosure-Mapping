import React, { useState, Component, Fragment, Suspense } from "react";
import ReactDOM from "react-dom";
import ReactDataGrid, { ValueFormatter } from "react-data-grid";
import { Toolbar, Data, Filters } from "react-data-grid-addons";
import { compose, withProps, withStateHandlers } from "recompose";
import PropTypes from 'prop-types';
import isEmpty from 'lodash.isempty';
import GoogleMapReact from 'google-map-react';


const defaultColumnProperties = {
  filterable: true,
  resizable: true,
  width: 120
};

const selectors = Data.Selectors;

const {
  NumericFilter,
  AutoCompleteFilter,
  MultiSelectFilter,
  SingleSelectFilter
} = Filters;

const columns = [
  {key: 'address', name: 'Address'},
  {key: 'zipcode', name: 'Zip Code', filterRenderer: MultiSelectFilter},
  {key: 'price', name: 'Loan Amount', filterRenderer: NumericFilter},
  {key: 'loandate', name: 'Loan Date'},
  {key: 'firstlistingdate', name: 'Listing Date'},
  {key: 'county', name: 'County', filterRenderer: MultiSelectFilter},
].map(c => ({ ...c, ...defaultColumnProperties }));

const handleFilterChange = filter => filters => {
  const newFilters = { ...filters };
  if (filter.filterTerm) {
    newFilters[filter.column.key] = filter;
  } else {
    delete newFilters[filter.column.key];
  }
  return newFilters;
};

function getValidFilterValues(rows, columnId) {
  return rows
    .map(r => r[columnId])
    .filter((item, i, a) => {
      return i === a.indexOf(item);
    });
}

function getRows(rows, filters) {
  return selectors.getRows({ rows, filters });
}

function HomeTable({ rows }) {
  const [filters, setFilters] = useState({});
  const filteredRows = getRows(rows, filters);
  return (
    <ReactDataGrid
      columns={columns}
      rowGetter={i => filteredRows[i]}
      rowsCount={filteredRows.length}
      toolbar={<Toolbar enableFilter={true} />}
      onAddFilter={filter => setFilters(handleFilterChange(filter))}
      onClearFilters={() => setFilters({})}
      getValidFilterValues={columnKey => getValidFilterValues(rows, columnKey)}
    />
  );
}


// InfoWindow component
const InfoWindow = (props) => {
  const { home } = props;
  const infoWindowStyle = {
    position: 'relative',
    bottom: 50,
    left: '-45px',
    width: 220,
    backgroundColor: 'white',
    boxShadow: '0 2px 7px 1px rgba(0, 0, 0, 0.3)',
    padding: 1,
    fontSize: 14,
    zIndex: 100,
  };

  return (
    <div style={infoWindowStyle}>
      <div style={{ fontSize: 16 }}>
        {home.address}
      </div>
    </div>
  );
};

// Marker component
const Marker = (props) => {
  const markerStyle = {
    border: '1px solid white',
    borderRadius: '50%',
    height: 10,
    width: 10,
    backgroundColor: props.show ? 'red' : 'blue',
    cursor: 'pointer',
    zIndex: 10,
  };

  return (
    <Fragment>
      <div style={markerStyle} />
      {props.show && <InfoWindow home={props.home} />}
    </Fragment>
  );
};

class MarkerInfoWindow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      homes: this.props.rows,
    };
  }


  // onChildClick callback can take two arguments: key and childProps
  onChildClickCallback = (key) => {
    this.setState((state) => {
      const index = state.homes.findIndex(e => e.id === key);
      var temp = state.homes[index].show;

      state.homes.forEach(home => {
        home.show = false;
      })

      state.homes[index].show = !temp; // eslint-disable-line no-param-reassign
      return { homes: state.homes };
    });
  };

  render() {
    const { homes } = this.state;

    return (
      <Fragment>
        {!isEmpty(homes) && (
          <GoogleMapReact
            defaultZoom={10}
            defaultCenter={{lat: 34.1, lng: -84.1}}
            bootstrapURLKeys={{ key: process.env.REACT_APP_GMAP_API_KEY }}
            onChildClick={this.onChildClickCallback}
          >
            {homes.map(home =>
              (<Marker
                key={home.id}
                lat={home.lat}
                lng={home.lng}
                show={home.show}
                home={home}
              />))}
          </GoogleMapReact>
        )}
      </Fragment>
    );
  }
}

InfoWindow.propTypes = {
  place: PropTypes.shape({
    address: PropTypes.string,
  }).isRequired,
};

Marker.propTypes = {
  show: PropTypes.bool.isRequired,
  place: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
};


class App2 extends Component {

  constructor(props) {
    super(props);

    this.state = {
      data : null,
      dataReturned: false
    };

  }

  componentDidMount() {

    fetch("/api/v1/homes/", {method: "GET"})
    .then(response => response.json())
    .then(result => {
      this.setState({
        data: result,
        dataReturned: true
      })
    });
  }

  render() {
      return (this.state.dataReturned ? 
      <Fragment>
      <div style={{width: '100%', height: '400px'}}>
        <MarkerInfoWindow rows={this.state.data}/>
        <HomeTable rows={this.state.data}/>
      </div>
      </Fragment> : <h1> Loading </h1>);
  }
}

ReactDOM.render(
  <App2 />,
  document.getElementById('root')
);
