import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const cardEmojis = ['🍔', '🍕', '🍟', '🍣', '🌭', '🌮', '🍩', '🥗'];

const FoodMemoryGame = () => {
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedIndices, setMatchedIndices] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);

    // Initialize game
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const shuffledCards = [...cardEmojis, ...cardEmojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({ id: index, emoji }));

        setCards(shuffledCards);
        setFlippedIndices([]);
        setMatchedIndices([]);
        setMoves(0);
        setIsWon(false);
    };

    const handleCardClick = (index) => {
        // Prevent click if already flipped, matched, or 2 cards are currently flipped
        if (flippedIndices.includes(index) || matchedIndices.includes(index) || flippedIndices.length === 2) {
            return;
        }

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setMoves((m) => m + 1);
            const [firstIndex, secondIndex] = newFlipped;

            if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
                // Match
                setMatchedIndices((prev) => {
                    const newMatched = [...prev, firstIndex, secondIndex];
                    if (newMatched.length === cards.length) {
                        setTimeout(() => setIsWon(true), 500);
                    }
                    return newMatched;
                });
                setFlippedIndices([]);
            } else {
                // No match
                setTimeout(() => {
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>Food Memory Match 🧩</h3>
                <div style={styles.stats}>
                    <p style={styles.moves}>Moves: {moves}</p>
                    <button style={styles.resetBtn} onClick={startNewGame}>Reset</button>
                </div>
            </div>

            <div style={styles.grid}>
                {cards.map((card, index) => {
                    const isFlipped = flippedIndices.includes(index) || matchedIndices.includes(index);
                    return (
                        <motion.div
                            key={card.id}
                            style={{ ...styles.cardWrapper, cursor: isFlipped ? 'default' : 'pointer' }}
                            onClick={() => handleCardClick(index)}
                            whileHover={!isFlipped ? { scale: 1.05 } : {}}
                            whileTap={!isFlipped ? { scale: 0.95 } : {}}
                        >
                            <motion.div
                                style={styles.cardInner}
                                initial={false}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                            >
                                <div style={styles.cardFront}>
                                    🍽️
                                </div>
                                <div style={styles.cardBack}>
                                    {card.emoji}
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {isWon && (
                    <motion.div
                        style={styles.winOverlay}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                    >
                        <h2 style={styles.winTitle}>You Won! 🎉</h2>
                        <p style={styles.winText}>Completed in {moves} moves!</p>
                        <button style={styles.playAgainBtn} onClick={startNewGame}>
                            Play Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    container: {
        background: '#ffffff',
        borderRadius: '24px',
        padding: '2rem',
        maxWidth: '500px',
        margin: '0 auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
        position: 'relative',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    title: {
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#1a1a1a',
    },
    stats: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    moves: {
        margin: 0,
        fontWeight: '600',
        color: '#555',
    },
    resetBtn: {
        background: 'rgba(255, 107, 107, 0.1)',
        color: '#ff6b6b',
        border: 'none',
        padding: '0.4rem 1rem',
        borderRadius: '20px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        perspective: '1000px',
    },
    cardWrapper: {
        aspectRatio: '1',
        borderRadius: '16px',
        perspective: '1000px',
    },
    cardInner: {
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
    },
    cardFront: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '2rem',
        boxShadow: '0 4px 15px rgba(255,107,107,0.2)',
    },
    cardBack: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        background: '#ffffff',
        border: '2px solid #ff6b6b',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '2.5rem',
        transform: 'rotateY(180deg)',
        boxShadow: '0 4px 15px rgba(255,107,107,0.2)',
    },
    winOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backdropFilter: 'blur(5px)',
    },
    winTitle: {
        fontSize: '3rem',
        color: '#ff6b6b',
        margin: '0 0 1rem 0',
        fontWeight: '900',
    },
    winText: {
        fontSize: '1.2rem',
        color: '#555',
        marginBottom: '2rem',
        fontWeight: '600',
    },
    playAgainBtn: {
        background: '#ff6b6b',
        color: 'white',
        border: 'none',
        padding: '1rem 2.5rem',
        borderRadius: '50px',
        fontSize: '1.2rem',
        fontWeight: '800',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(255, 107, 107, 0.4)',
        transition: 'all 0.3s',
    }
};

export default FoodMemoryGame;
