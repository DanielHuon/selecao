"use client";

import React, { useState } from 'react';
import useSWR, { SWRResponse } from 'swr';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import { FloatingActionButton } from "@progress/kendo-react-buttons";

interface Pokemon {
  name: string;
  id: number;
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
  moves: {
    move: {
      name: string;
    };
  }[];
}

const fetcher = async (url: string): Promise<Pokemon> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
};

export default function Home() {
  const [pokemonId, setPokemonId] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  //aqui eu dou fetch na api para exibir o pokemon atual
  const { data: pokemon, error }: SWRResponse<Pokemon, Error> = useSWR(
    `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
    fetcher
  );

  const handleNextPokemon = () => {
    setPokemonId(pokemonId + 1);
  };

  const handlePreviousPokemon = () => {
    if (pokemonId > 1) {
      setPokemonId(pokemonId - 1);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert('Por favor, insira um ID ou nome de Pokémon válido.');
      return;
    }

    //verificação se é um ID ou nome
    const newId = parseInt(searchTerm);
    if (!isNaN(newId)) {
      setPokemonId(newId);
    } else {
      fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`)
        .then(res => res.json())
        .then(data => {
          setPokemonId(data.id);
        })
        .catch(() => {
          alert('Pokémon não encontrado. Por favor, insira um ID ou nome de Pokémon válido.');
        });
    }
  };

  if (error) return <div>Erro ao carregar dados do Pokémon</div>;
  if (!pokemon) return <div>Carregando...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <input
        type="text"
        placeholder="Pesquisar por ID ou Nome"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: '10px',
          borderRadius: '10px',
          border: '2px solid #3f51b5',
          marginRight: '10px',
          color: '#000',
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          backgroundColor: '#3f51b5',
          color: '#fff',
          borderRadius: '10px',
          padding: '10px 20px',
        }}
      >
        Pesquisar
      </button>
      <div style={{ textAlign: 'center' }}>
        <FloatingActionButton
          onClick={handlePreviousPokemon}
          text="Anterior"
          style={{
            backgroundColor: '#3f51b5',
            color: '#fff',
            borderRadius: '10px',
            padding: '10px 20px',
          }}
        />
        <FloatingActionButton
          onClick={handleNextPokemon}
          text="Próximo"
          style={{
            backgroundColor: '#3f51b5',
            color: '#fff',
            borderRadius: '10px',
            padding: '10px 20px',
          }}
        />
        <div style={{ border: '2px solid red', padding: '10px', marginBottom: '10px', borderRadius: '10px' }}>
          <p>#{pokemon.id} na Pokedex</p>
          <img src={pokemon.sprites.front_default} alt={pokemon.name} style={{ width: '250px', height: '250px' }} />
        </div>
      </div>

      <Grid data={[pokemon]} style={{ alignItems: 'center', border: '2px solid red', padding: '10px', borderRadius: '10px' }}>
        <Column field="name" title="Nome" width="100px" />
        <Column field="id" title="ID" width="25px" />
        <Column field="types" title="Tipo" width="50px" cell={(props) => (
          <td>
            {props.dataItem.types.map((type: any) => type.type.name).join(', ')}
          </td>
        )} />
      </Grid>

      <div style={{ justifyContent: 'space-between', fontWeight: 'bold' }}>
        <p style={{ marginBottom: '10px' }}>Golpes</p>
      </div>
      <Grid
        data={pokemon.moves}
        style={{ height: '300px', overflowY: 'scroll' }}
        scrollable="scrollable"
      >
        <Column
          field="move.name"
          title="-"
          width="auto"
          cell={(props) => (
            <td>
              <div style={{ color: '#000', backgroundColor: 'lightgreen', padding: '5px', borderRadius: '5px', margin: '2px 0' }}>
                {props.dataItem.move.name}
              </div>
            </td>
          )}
        />
      </Grid>
    </main>
  );
}
