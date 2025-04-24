import { useEffect, useRef, useState } from 'react';
import { Box, Grid, Paper } from '@mui/material'
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
interface PokemonData {
  name: string;
  url: string;
}

interface Card {
  id: string;
  name: string;
  cry: string;
  img: string;
  sprites: string[];
  isFlipped: boolean;
  isMatched: boolean;
}

const CardContainer = styled(Box)(({ theme }) => ({
  aspectRatio: '1/1',
  backgroundColor: theme.palette.primary.light,
  backfaceVisibility: 'hidden',
  borderRadius: 0,
  color: theme.palette.primary.contrastText,
  cursor: 'pointer',
  display: 'flex',
  position: 'relative',
  perspective: 1000,
  userSelect: 'none',
})) as typeof Box;

const CardFront = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  borderRadius: 0,
  color: theme.palette.primary.contrastText,
  height: '100%',
  width: '100%',
  zIndex: 99,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  '& div': {
    backfaceVisibility: 'hidden',
    left: '0%',
    position: 'absolute',
    top: '0%',
    transformStyle: 'preserve-3d',
    transform: 'rotateX(0deg)',
    textAlign: 'center',
  },
})) as typeof Paper;

const CardBack = styled(Paper)(({ theme }) => ({
  '& img': {
    backgroundColor: theme.palette.primary.light,
    borderRadius: 0,
    color: theme.palette.primary.contrastText,
    height: '100%',
    left: '0%',
    objectFit: 'contain',
    position: 'absolute',
    top: '0%',
    transform: 'rotateX(-180deg)',
    transformStyle: 'preserve-3d',
    width: '100%',
  }
})) as typeof Paper;


export default function Board() {
  const [cards, setCards] = useState<Card[]>([]);
  const [first, setFirst] = useState<Card | null>();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        // fetch list of pokemon
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=16');
        if (!response.ok) {
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
              img: data.sprites?.other['official-artwork']['front_default'] || '',
              sprites: [
                data.sprites?.back_default,
                data.sprites?.back_shiny,
                data.sprites?.front_default,
                data.sprites?.front_shiny,
              ]
            }
          })
        );
        // create pairs
        const pairs: Card[] = detailedPokemon.reduce<Card[]>((acc, p) => {
          acc.push({ ...p, id: `${p.id}-1`, isFlipped: false, isMatched: false });
          acc.push({ ...p, id: `${p.id}-2`, isFlipped: false, isMatched: false });
          return acc;
        }, []);
        // shuffle
        const pokemon = pairs.sort(() => Math.random() - 0.5);
        setCards(pokemon);
      }
      catch (err) {
        console.log('Something went wrong');
        console.log({ err });
      }
    }
    fetchPokemonData();
  }, []);

  // todo: add display loading
  // todo: add display error

  const handleClick = (id: string, name: string) => {
    const selected = cards.find((c) => (c.id === id));
    if (!first) {
      setCards(
        cards.map((c) => (c.id === id) ? { ...c, isFlipped: true } : c)
      );
      setFirst(selected);
    }
    else if (selected?.name === first.name) {
      setCards(
        cards.map((c) => (c.name === name) ? {
          ...c,
          isFlipped: true,
          isMatched: true
        } : c)
      );
      emitCry(selected.cry);
      setFirst(null);
    }
    else {
      setCards(
        cards.map((c) => (c.id === id) ? { ...c, isFlipped: true } : c)
      );
      setTimeout(() => clearSelected(id), 750);
    }
  }

  function emitCry(src: string) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = src;
      audioRef.current.volume = 0.5;
      audioRef.current.play();
    }
  }

  function clearSelected(id: string) {
    setCards(
      cards.map((c) => (c.id === id || c.id === first?.id) ? {
        ...c,
        isFlipped: false
      } : c)
    );
    setFirst(null);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <audio ref={audioRef} />
      <Grid
        container
        columns={8}
        spacing={1}
        justifyContent="center"
        alignItems="center"
      >
        {cards.map((c) => (
          <Grid key={c.id} size={1}>
            <CardContainer
              animate={{ rotateX: c.isFlipped ? 180 : 0 }}
              component={motion.div}
              onClick={() => handleClick(c.id, c.name)}
              transition={{ duration: 0.5 }}
            >
              <CardFront component={motion.div} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <QuestionMarkIcon fontSize='large' />
              </CardFront>
              <CardBack component={motion.div}>
                <img src={c.img} alt={c.name} />
              </CardBack>
            </CardContainer>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}