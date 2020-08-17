// This is a web worker script that supports InglenookSidingsThreaded.html.
// It must be present in the same directory as that file.
// It is only used for the full puzzle version.
'use strict';

Array.prototype.isEmpty = function() {
  return !Array.isArray(this) || !this.length;
};

function newCopyState(state) {
  return { t0: state.t0.slice(0), t1: state.t1.slice(0),
           t2: state.t2.slice(0), t3: state.t3.slice(0),
           lastOpTrack: state.lastOpTrack };
}

function equalStates(state1, state2) {
  return ((JSON.stringify(state1.t0) === JSON.stringify(state2.t0)) &&
          (JSON.stringify(state1.t1) === JSON.stringify(state2.t1)) &&
          (JSON.stringify(state1.t2) === JSON.stringify(state2.t2)) &&
          (JSON.stringify(state1.t3) === JSON.stringify(state2.t3)));
}

// Return new state from pulling numPull cars from Track track (to Track 0)
// in state.  Return empty state if move is not possible.
function pullCars(state, numPulls, track, trkCaps) {

  let newState = null;

  switch (track) {
    case 1:   if ((state.t1.length >= numPulls) &&
                  ((trkCaps[0] - state.t0.length) >= numPulls)) {
                newState = newCopyState(state);
                for (let i = 0; i < numPulls; i++) {
                  newState.t0.push(newState.t1.shift());
                }
                newState.lastOpTrack = track;
              }
              break;

    case 2:   if ((state.t2.length >= numPulls) &&
                  ((trkCaps[0] - state.t0.length) >= numPulls)) {
                newState = newCopyState(state);
                for (let i = 0; i < numPulls; i++) {
                  newState.t0.push(newState.t2.shift());
                }
                newState.lastOpTrack = track;
              }
              break;

    case 3:   if ((state.t3.length >= numPulls) &&
                  ((trkCaps[0] - state.t0.length) >= numPulls)) {
                newState = newCopyState(state);
                for (let i = 0; i < numPulls; i++) {
                  newState.t0.push(newState.t3.shift());
                }
                newState.lastOpTrack = track;
              }
              break;

    default:  break;
  }

  return newState;
}

// Return new state from dropping numDrops cars (from Track 0) to Track
// track in state.  Return empty state if move is not possible.
function dropCars(state, numDrops, track, trkCaps) {

  let newState = null;

  switch (track) {
    case 1:   if ((state.t0.length > numDrops) &&
                  ((trkCaps[1] - state.t1.length) >= numDrops)) {
                newState = newCopyState(state);
                for (let i = 0; i < numDrops; i++) {
                  newState.t1.unshift(newState.t0.pop());
                }
                newState.lastOpTrack = track;
              }
              break;

    case 2:   if ((state.t0.length > numDrops) &&
                  ((trkCaps[2] - state.t2.length) >= numDrops)) {
                newState = newCopyState(state);
                for (let i = 0; i < numDrops; i++) {
                  newState.t2.unshift(newState.t0.pop());
                }
                newState.lastOpTrack = track;
              }
              break;

    case 3:   if ((state.t0.length > numDrops) &&
                  ((trkCaps[3] - state.t3.length) >= numDrops)) {
                newState = newCopyState(state);
                for (let i = 0; i < numDrops; i++) {
                  newState.t3.unshift(newState.t0.pop());
                }
                newState.lastOpTrack = track;
              }
              break;

    default:  break;
  }

  return newState;

}

// Given a state, return a list of its legal successor states
function successorStates(state, trkCaps) {

  let maxPD = trkCaps[0] - 1;
  let lOT = state.lastOpTrack;
  let successors = [];
  let newState;

  // Requiring a successor to result from a move on a different track
  // reduces the size of the search tree, but does not affect finding a
  // minimal path.  Because no minimal solution will have two consecutive
  // moves on the same track.
  for (let ncars = maxPD; ncars > 0; ncars--) {
    for (let trk = 1; trk < 4; trk++) {
      if (trk != lOT) {   // See comment above
        newState = pullCars(state, ncars, trk, trkCaps);
        if (newState !== null) { successors.push(newState); }
        newState = dropCars(state, ncars, trk, trkCaps);
        if (newState !== null) { successors.push(newState); }
      }
    }
  }

  return successors;
}

// Given a path, return a list of allowed extensions constructed
// from successors of the last state in the path, not including
// successors that already appear in the path (to avoid cycles).
// No extension may exceed the given limit in length.
function pathExtensions(path, lenLimit, trkCaps) {

  let extensions = [];
  let npath = path.length;

  // If path already at length limit, return empty list
  if (npath >= (lenLimit + 1)) { return extensions; }

  // Get last state in path and get its legal successors
  let successors = successorStates(path[npath - 1], trkCaps);

  // If path has no legal successors, return empty list
  if (successors.isEmpty()) { return extensions; }

  let nSucc = successors.length;
  for (let i = 0; i < nSucc; i++) {
    if (!(path.indexOf(successors[i]) >= 0)) {
      let newPath = path.slice(0);
      newPath.push(successors[i]);
      extensions.push(newPath);
    }
  }

  return extensions;
}

// Find path from start state to finish state with length <= lenLimit
// Uses limited depth-first search based on queue of paths from start
// state.
function findSolutionLimited(startState, finalState, lenLimit, last2Flag,
                              trkCaps) {

  // Ensure start state has zero lastOpTrack value so that there is
  // no restriction on successor states at start
  startState.lastOpTrack = 0;
  // Initialize start path and path queue
  let startPath = [startState];
  let pathQueue = [startPath];
  // The final state must always have at least 2 cars on track 1
  let n1 = finalState.t1.length;
  let car1 = finalState.t1[n1 - 1];
  let car2 = finalState.t1[n1 - 2];

  let firstPath = [];
  while (!pathQueue.isEmpty()) {

    firstPath = pathQueue.pop();
    let lastState = firstPath[firstPath.length - 1];
    // If first path in queue is a solution, return it.
    // If last2Flag is true, a solution only matches the last
    // 2 cars on T1 in the final state.  This is used for an
    // intermediate step in a heuristic solution.
    if (last2Flag) {
      let n2 = lastState.t1.length;
      if ((n2 > 1) && (lastState.t1[n2 - 1] == car1) &&
            (lastState.t1[n2 - 2] == car2)) {
        return firstPath;
      }
    } else {
      if (equalStates(lastState, finalState)) {
        return firstPath;
      }
    }
    // Otherwise, replace first path with its extensions
    let extList = pathExtensions(firstPath, lenLimit, trkCaps);
    if (!extList.isEmpty()) {
      let lexl = extList.length;
      for (let i = 0; i < lexl; i++) {
        pathQueue.push(extList.pop());
      }
    }

  }

  // If path not found, return empty path
  startPath = [];
  return startPath;
}

// Find solution by splicing two "pure" solutions at an intermediate
// puzzle state.  The intermediate state is any state where the last
// two cars on Track 1 agree with those in the final state.
// This approach is used for the full-sized puzzle due to the length
// of the calculations needed.  The final path length is not necessarily
// minimal.
function findHeuristicSolution(startState, finalState, maxLimit, trkCaps) {

  let solution1 = [];
  let solution2 = [];

  // First find pure solution to an intermediate state
  let lenLimit = 0;

  while ((lenLimit < maxLimit) && solution1.isEmpty()) {
    lenLimit++;
    solution1 = findSolutionLimited(startState, finalState,
                lenLimit, true, trkCaps);
  }

  // Second find pure solution from intermediate state to final state
  let newStartState = solution1.pop();
  if (equalStates(newStartState, finalState)) {
    solution1.push(newStartState);  // Intermediate node is finalState.  Done.
  }
  else {
    let lastOpTrackSol1 = newStartState.lastOpTrack;
    newStartState.lastOpTrack = 0;

    lenLimit = 0;
    while ((lenLimit < maxLimit) && solution2.isEmpty()) {
      lenLimit++;
      solution2 = findSolutionLimited(newStartState, finalState,
                  lenLimit, false, trkCaps);
    }

    // If track of first move in solution2 is the same as the track
    // for the last move of solution1, drop the newStartState before
    // joining the solutions (unless it is the finalState).
    let firstOpTrackSol2 = solution2[1].lastOpTrack;
    if ((firstOpTrackSol2 === lastOpTrackSol1) && (solution2.length > 1)) {
      solution2.shift();
    }
    // Join the solutions
    let lenSol2 = solution2.length;
    for (let i = 0; i < lenSol2; i++) {
      solution1.push(solution2.shift());
    }
  }

  return solution1;
}

onmessage = function(ev) {

  let obj = JSON.parse(ev.data);
  let state1 = obj.s1;
  let state2 = obj.s2;
  let trkCaps = obj.tc;
  let solution = findHeuristicSolution(state1, state2, 25, trkCaps);
  let text = JSON.stringify(solution);
  this.postMessage(text);

};
