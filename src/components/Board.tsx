import { useEffect, useState } from 'react';
import { Box, Grid, Paper } from '@mui/material'
import { styled } from '@mui/material/styles';

const CardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  aspectRatio: '1 / 1', // Ensure square cards
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },

}));

const CardFront = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  '& div': {
    height: '100%',
    width: '100%'
  }
})) as typeof Paper;

const CardBack = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  '& img': {
    height: '100%',
    width: '100%',
    objectFit: 'contain'
  }
})) as typeof Paper;

interface PokemonData {
  name: string;
  url: string;
}

interface Card {
  id: string;
  name: string;
  cry: string;
  img: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function Board() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const fetchPokemonData = async () => {
      try{
        // fetch list of pokemon
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=16');
        if(!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pokemonListData = await response.json();
        const pokemonList: PokemonData[] = pokemonListData.results;

        // fetch individual pokemon data
        const detailedPokemon = await Promise.all(
          pokemonList.map(async (p) => {
            const dataResponse = await fetch(p.url);
            const data = await dataResponse.json();
            return {
              id: data.id,
              name: data.name,
              cry: data.cries['latest'] || '',
              img: data.sprites?.other['official-artwork']['front_default'] || ''
            }
          })
        );
        // create pairs
        const pairs: Card[] = detailedPokemon.reduce<Card[]>((acc, p) => {
          acc.push({...p, id: `${p.id}-1`, isFlipped: false, isMatched: false });
          acc.push({...p, id: `${p.id}-2`, isFlipped: false, isMatched: false });
          return acc;
        }, []);
        // shuffle
        const pokemon = pairs.sort(() => Math.random() - 0.5);
        setCards(pokemon);
      }
      catch(err) {
        console.log('Something went wrong');
        console.log({ err });
      }
    }
    fetchPokemonData();
  }, []);
  
  // todo: add display loading

  // todo: add display error

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid
        container
        columns={8}
        spacing={1}
        justifyContent="center"
        alignItems="center"
      >
        {cards.map((p) => (
          <Grid
            key={p.id}
            size={1}
          >
            <CardContainer>
              <CardFront>?</CardFront>
              <CardBack>
                <img src={p.img} alt={p.name} />
              </CardBack>
            </CardContainer>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}