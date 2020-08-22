# <u>Programs</u>
<font size="4">
File descriptions:

InglenookSidingsBrowser.html - Create and solve the Inglenook Sidings
shunting puzzle in a browser (Chrome, Firefox, or Edge).  Includes an
animation of the solution, once found.

InglenookSidingsThreaded.html - Same as above, but uses separate threads
for part of the solution process.  This will give faster results for
longer solutions, but a special setup is needed.  See the file
threaded.txt.

is-worker.js - This is a helper for the threaded version above and must
be in the same directory as it.

overheads.md, overheads.html - More information on solution methods and results.

</font>

# <u>The Inglenook Sidings Puzzle</u>
<font size="5">

- The Inglenook Sidings shunting puzzle uses the following track
configuration with fixed track capacities. Note how the switching
lead track (head shunt) is limited to the engine plus three cars.

<pre>

                                   /------------- Track 3
                                  /    3 cars
    West                         /
                                /----------------  Track 2   East
    Switching Lead, Track 0    /       3 cars
        (Head Shunt)          /
     ------------------------/---------------------  Track 1
        Engine + 3 cars                5 cars

</pre>

- For input and output the tracks are represented by lists containing
the occupying cars in the order from west to east.

- The cars are represented by the numbers 1 to 8.  The engine
is represented by zero.

- The engine is assumed to be on the west end of all movements.  The
engine must be on the west end of track 0 in the start and end
conditions (states).

</font>

# <u>Standard Problems</u>
<font size="5">

- Start: Five cars on track 1, three cars on track 2, engine on lead.  Cars are randomly assigned the numbers from 1 to 8.

- End: Five cars on track 1, three cars on track 2, engine on lead. Cars are in increasing order starting on west end of track 1.

- Example:
<pre>
  Start:  Track 0: 0 (engine)
          Track 1: 3, 2, 7, 5, 1
          Track 2: 4, 8, 6
          Track 3: empty

  End:    Track 0: 0 (engine)
          Track 1: 1, 2, 3, 4, 5
          Track 2: 6, 7, 8
          Track 3: empty
</pre>
</font>

# <u>Solutions</u>
<font size="5">

- A solution is a series of puzzle "states" connected by a move, either a "pull" or "drop" of 1 to 3 cars

- The number of cars in a move is constrained by the track capacities

- Here is a solution to the example above:

</font>
<font size="5">

```
    Moves: 14
    Solution:
    [[0],       [3,2,7,5,1],  [4,8,6],  []]         (Start state)
    [[0,3,2,7], [5,1],        [4,8,6],  []]         Pull 3 Track 1
    [[0,3],     [5,1],        [4,8,6],  [2,7]]      Drop 2 Track 3
    [[0,3,5,1], [],           [4,8,6],  [2,7]]      Pull 2 Track 1
    [[0,3,5],   [],           [4,8,6],  [1,2,7]]    Drop 1 Track 3
    [[0,3],     [5],          [4,8,6],  [1,2,7]]    Drop 1 Track 1
    [[0,3,4],   [5],          [8,6],    [1,2,7]]    Pull 1 Track 2
    [[0],       [3,4,5],      [8,6],    [1,2,7]]    Drop 3 Track 1
    [[0,1,2],   [3,4,5],      [8,6],    [7]]        Pull 2 Track 3
    [[0],       [1,2,3,4,5],  [8,6],    [7]]        Drop 2 Track 1
    [[0,8,6],   [1,2,3,4,5],  [],       [7]]        Pull 2 Track 2
    [[0,8],     [1,2,3,4,5],  [],       [6,7]]      Drop 1 Track 3
    [[0],       [1,2,3,4,5],  [8],      [6,7]]      Drop 1 Track 2
    [[0,6,7],   [1,2,3,4,5],  [8],      []]         Pull 2 Track 3
    [[0],       [1,2,3,4,5],  [6,7,8],  []]         Drop 2 Track 2
```

</font>

