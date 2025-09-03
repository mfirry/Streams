{-# LANGUAGE OverloadedStrings #-}

module Main where

import Conduit

-- Define the stream: emit numbers 1..5 and double them
stream :: Monad m => ConduitT () Int m ()
stream = yieldMany [1..5] .| mapC (*2)

-- Define the run action: print each number, discard results
run :: IO ()
run = runConduit $ stream .| mapM_C print

main :: IO ()
main = run
