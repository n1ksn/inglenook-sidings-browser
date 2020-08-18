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

# <u>Solution Methods - Dijkstra's Algorithm</u>

<font size="5">

- Each of the 2,580,480 possible puzzle states is a node in a graph where two nodes are connected by an edge if there is an allowed move between them.  (Since any move is reversible, the edges are said to be "undirected.")

- The standard final state is set as the "root node"

- The algorithm finds a shortest path (a series of edges) from each node to the root node

- In particular, a path found from any of the 40320 (= 8!) standard start states to the root node is an "optimal" puzzle solution because it has the fewest moves possible (but it is not necessarily unique)

- A table constructed from the algorithm can be used to produce a puzzle solution on demand when ***any*** puzzle state is set as the start; but the final state must be the ***standard*** final state unless the entire table is recalculated with a new root node.

</font>

# <u>Solution Methods - Interated Depth-First Tree Search</u>

<font size="5">

- The start state is the root node of a tree graph.  The child (successor) nodes of the root node are the puzzle states that can be reached by a single move from the root node.

- The child nodes of any other node are the states that can be reached by a single move from the "parent" node ***and*** meet two conditions:

  1. The child does not appear in the "branch" from the parent back to the root
  2. The move from the parent to the child involves a track different from the track in the move from the parent of the parent to the parent

- The condition (1) above is mandatory for the graph to be a tree.  The condition (2) is not required, but it cuts down the size of the tree and the time of the search without hurting the search for a shortest solution path.  Because no shortest solution will have two successive moves on the same track.  (Think about it!)

- The iterated depth-first search algorithm starts at the root node and looks for the final state by successively travelling down the paths of increasingly deeper trees until it finds a node that is the final state.  The solution is then the series of nodes on the branch from the root node to the final state node.

- An iterated depth-first search will also find a puzzle solution with the miniumum possible number of moves.  However, it can take a long time, as the trees grow very quickly in size as they get deeper.

</font>

# <u>Solution Methods - A Heuristic Approach</u>

<font size="5">

- If one is willing to accept solutions that are not always of shortest length (but are not ***too*** long), there is a way to modifiy the iterated depth-first approach that has "reasonable" calculation times.

- Start with an iterated depth-first search, but instead of ending at the final state, stop when the search comes to ***any*** node with the last three cars on Track 1 the same as the last three cars on Track 1 in the final state.  Call this the "intermediate node."

- Then do a second search starting from the intermediate node and ending at the final state.

- Splice the two partial solutions together (and drop the intermediate node if keeping it would result in two successive moves on the same track).  Call this the "forward" solution.

- Redo the three steps above, but starting with the final state and ending with the start state.  Call this the "reverse" solution.

- Choose the shorter of the forward and reverse solutions as the final heuristic solution, reversing the reverse solution if it was chosen.

</font>

# <u>Solution Methods - Overall Comparison</u>

<style>
th { font-size: 1.5em }
td { font-size: 1.5em }
</style>
<font size="5">

- Here is a table showing the number of moves for the heuristic and optimal solutions to all standard start states, and a plot of their cumulative frequencies:

<center>

| - Moves - | - Heuristic % - | - Optimal % - |
|:-----:|:-----------:|:---------:|
| < 10  |  1.25   |  1.70   |
|  10   |  1.35   |  2.00   |
|  11   |  3.44   |  4.65   |
|  12   |  5.63   |  7.75   |
|  13   |  10.44  |  13.49  |
|  14   |  13.47  |  17.80  |
|  15   |  17.30  |  20.15  |
|  16   |  17.01  |  18.42  |
|  17   |  14.24  |  9.74   |
|  18   |  8.63   |  3.55   |
|  19   |  4.75   |  0.73   |
|  20   |  2.01   |  0.02   |
| > 20  |  0.48   |  0.00   |

![](cumulative-distributions.png)

</center>

- We see that on the whole, the distribution of heuristic solutions is only about one move more than the optimal solutions

- But a more meaningful comparison, especially for the puzzle player, might be a pairwise comparison of the two solution methods

</font>

# <u>Solution Methods - A Pairwise Comparison</u>

<style>
th { font-size: 1.5em }
td { font-size: 1.5em }
</style>
<font size="5">

- How does a particular heuristic solution compare to the optimal solution of the same start state?  It can't be shorter, but we hope it isn't too much longer.

- Below is a frequency table for the differences (heuristic solution length) - (optimal solution length) for all 40320 standard start conditions:

<center>

|  Difference  |  Percent  |
|:------------:|:---------:|
|      0       |    47.3   |
|      1       |    32.1   |
|      2       |    15.1   |
|      3       |    4.7    |
|    4 - 6     |    0.8    |

</center>

- Almost half the puzzle start states have a heuristic solution that is optimal (minimum possible number of moves)

- About a third of the heuristic solutions are only one move longer than the minimum possible

- About fifteen percent are only two moves longer

- About five percent are three moves longer

- Less than one percent are four or more moves longer

</font>
