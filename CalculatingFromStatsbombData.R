rm(list = ls())

library(data.table)
library(ggplot2)
library(rjson)
library(CodaBonito)
library(snowfall)

################################################################################
# Input parameters
################################################################################

if ( T ) {

    # What resolution to compute xPo at
    # This can be infinitesimally small but run time is order of n^2 so you choose
    # With the nCalculationResolution = 2, parallelised on 3 cores, this will take
    # between 1-2 hours to run.
    # The resolution is set to 10 so that the first time oyu run it, it gets
    # over quickly and you can see results. Like a test drive.
    # make sure pitch dimensions are a multiple of this
    # if you change the resolution, wipe out the previous contents or write to
    # a difference location because cOutputPath
    # the code won't overwrite existing files. It could overwrite it but if you are 
    # careless and overwrite things then you're going to waste a lot of time
    nCalculationResolution = 10

    # pitch dimensions you want to scale it to
    # make sure this is a multiple of nCalculationResolution
    nXLimit = 120
    nYLimit = 80
    # dimensions in the raw data
    nXLimitInData = 100
    nYLimitInData = 100

    # What sort of area around the specific coordinate being analysed should be
    # considered to calculate xPo
    # Events which are just a function of start coordinate, like shots, tackles, etc.
    # will use this
    nOnePointsSDRadial = 2
    # Events which are a function of start and end coordinate, like passes, runs, etc.
    # will use this
    nTwoPointsSDRadial = 3.33
    # Radius * this will be the area around each coordinate that gets considered
    nZBoundary = 4
    # all events that have their coordinate(s) fall within the ZBoundary * SDRadial
    # will be considered to calculate the xPo for that set of coordinates

    # If a carry's displacement is less than this number, it won't be considered 
    # in the xPo calculation
    nMinMoveDistance = 20

    # Parameter to help with storing the results correctly.
    # Can add conceding to this, for example, and update the code to make that 
    # happen too
    cWhatIsBeingMeasured = 'Scoring'


    # Are you calculating xPo for the team's actions or for the actions of their
    # opponents?
    # cTag = 'Against'
    cTag = 'For'

    # Barcelona's team ID in the Statsbomb data
    cTeamId = '217'

    # If left null, it will look at the whole team, if selected, this will look at
    # actions only by that specific player
    cPositionId = NULL
    # cPositionId = 1
    # cPositionId = 6
    # cPositionId = 5
    # cPositionId = 3
    # cPositionId = 2
    # cPositionId = 10
    # cPositionId = 15
    # cPositionId = 13
    # cPositionId = 21
    # cPositionId = 23
    # cPositionId = 17

    # Where to get the data from
    cDataRepoPath = '/media/ask/Data/Personal/Projects/Personal/open-data/'
    # Where to save the output
    cOutputPath = '/media/ask/Data/Personal/Projects/Personal/tmp/'

    # which season of data to consider
    # the code only considers one season at a time but can be extended to consider
    # as many matches, seasons, etc.
    cSeasonFilePath = paste0(
        cDataRepoPath,
        '/data/matches/11/41.json' 
    )

    # May not be a good idea to mix up many formations so you can specify one
    # This may not work perfectly so would suggest leaving it as null for now
    cFormationToAnalyse = NULL
    # cFormationToAnalyse = '433'

    # the events that we want to extra from the Statsbomb data
    vcTagsToExtract = c("Starting XI",'Pass','Shot','Carry','Tactical Shift','Substitution')

    # Don't go higher than n -1 where n is the total cores on your copmuter
    iCoresToParalleliseOver = 3

}






################################################################################
# Functions
################################################################################

if ( T ) {

    fEuclideanDistance = function (
        x1, y1, x2, y2
    ) {
        ( 
            ( ( x1 - x2 ) ^ 2 ) + 
            ( ( y1 - y2 ) ^ 2 ) 
        ) ^ 0.5 
    }
    

    fCalculateOneCoordinatexPo = function (
        dtEvents,
        x1,
        y1,
        sdRadial = 2,
        nZBoundary = 4
    ) {
        
        dtProbability = dtEvents[
            (
                ( ( x - x1 ) ^ 2 ) +
                ( ( y - y1 ) ^ 2 )
            ) ^ 0.5 < ( nZBoundary  * sdRadial )
        ]
        
        if ( nrow(dtProbability) > 0 ) {
            
            dtProbability[
                is.na(isGoal),
                isGoal := F
            ]
        
            dtProbability = dtProbability[,
                list(
                    # pdf of guassian such that pdf at centre is 1
                    Weight = exp(
                    -0.5 * 
                        (
                            ( ( x - x1 ) ^ 2 ) +
                            ( ( y - y1 ) ^ 2 )
                        ) / 
                        ( sdRadial ^ 2 )
                    )# * ( 1 / ( ( ( 2 * pi ) ^ 0.5 ) * sdRadial ) )
                    ,
                    matchId,
                    teamId,
                    isGoal,
                    shotId,
                    GoalProbability
                )
            ]
            
            
            dtProbability = dtProbability[,
                list(
                    Count = .N,
                    WeightedCount = sum(Weight),
                    Goals = sum(isGoal),
                    GoalIds = list(unique(shotId[isGoal == T & !is.na(shotId)])),
                    # Shots = list(unique(shotId[!is.na(shotId)])),
                    WeightedGoals = sum( isGoal * Weight ),
                    xPo = weighted.mean(x = GoalProbability, w = Weight),
                    WeightedExpectedGoals = sum(GoalProbability * Weight)
                )
            ]
            
        } else {
            
            dtProbability = data.table(
                Count = 0,
                xPo = NA
            )
            
        }
        
        dtProbability
        
    }


    fCalculateTwoCoordinatexPo = function (
        dtBallMoveGoalProbability,
        dtShots,
        sdRadial = 3.33,
        nZBoundary = 4
    ) {
        
        if ( nrow(dtBallMoveGoalProbability) > 0 ) {
            
            dtBallMoveGoalProbability = merge(
                dtBallMoveGoalProbability,
                dtShots[, 
                    list(
                        teamId, matchId, playId, eventSequence,
                        isGoal,
                        GoalProbability
                    )
                ],
                all.x = T,
                allow.cartesian = T,
                c('matchId','teamId','playId')
            )

            dtBallMoveGoalProbability[
                is.na(eventSequence.y),
                eventSequence.y := -1
            ]

            dtBallMoveGoalProbability = dtBallMoveGoalProbability[
                eventSequence.x < eventSequence.y |
                eventSequence.y < 0          
            ]
            
            # didn't lead to a shot at all so 0 is fine?
            dtBallMoveGoalProbability[
                is.na(GoalProbability),
                GoalProbability := 0
            ]
        
            # didn't lead to a shot at all so 0 is fine?
            dtBallMoveGoalProbability[
                is.na(isGoal),
                isGoal := 0
            ]

            dtBallMoveGoalProbability = dtBallMoveGoalProbability[,
                list(
                    Shots = sum(eventSequence.y > 0),
                    GoalProbability = fCompoundProbabilities(GoalProbability[order(eventSequence.y)]),
                    Goals = sum(isGoal)
                ),
                list(
                    matchId, teamId, playId,
                    eventSequence = eventSequence.x,
                    x, y, endX, endY,
                    x1, y1, x2, y2,
                    event
                )
            ]

            dtBallMoveGoalProbability = dtBallMoveGoalProbability[,
                list(
                    # pdf of guassian such that pdf at centre is 1
                    Weight = (
                    (
                        exp(
                            -0.5 * 
                            (
                                ( ( x - x1 ) ^ 2 ) +
                                ( ( y - y1 ) ^ 2 )
                            ) / 
                            ( sdRadial ^ 2 )
                        )
                    )  *
                    (
                        exp(
                            -0.5 * 
                            (
                                ( ( endX - x2 ) ^ 2 ) +
                                ( ( endY - y2 ) ^ 2 )
                            ) / 
                            ( sdRadial ^ 2 )
                        )
                    )
                    ) #  * ( 1 / ( 2 * pi * ( sdRadial ^ 2 ) ) )
                    ,
                    matchId,
                    teamId,
                    playId,
                    eventSequence,
                    GoalProbability,
                    Goals,
                    Shots,
                    # GoalIds,
                    # ShotIds,
                    event,
                    x1,
                    y1,
                    x2,
                    y2
                )
            ]
            
            # dtBallMoveGoalProbability[,
            #    Weight := Weight / sum(Weight)
            # ]
            
            # print(dtBallMoveGoalProbability[isGoal == T])
            
            dtBallMoveGoalProbability = dtBallMoveGoalProbability[,
                list(
                    Count = .N,
                    Goals = sum(Goals),
                    Shots = sum(Shots),
                    # GoalIds = list(unique(unlist(GoalIds))),
                    # ShotIds = list(unique(unlist(ShotIds))),
                    WeightedCount = sum( Weight, na.rm = T),
                    WeightedGoals = sum( Goals * Weight, na.rm = T ),
                    WeightedShots = sum( Shots * Weight, na.rm = T ),
                    WeightedExpectedGoals = sum( GoalProbability * Weight, na.rm = T )
                ),
                list(
                    x1,
                    y1,
                    x2,
                    y2,
                    event
                )
            ][,
                xPo := WeightedExpectedGoals / WeightedCount
            ]
            
            if ( F ) {
                    
                dtBallMoveGoalProbability[Goals == 0, GoalIds := NA]
                dtBallMoveGoalProbability[Shots == 0, ShotIds := NA]
                
                dtBallMoveGoalProbability[,
                    ShotIds := sapply(
                        ShotIds,
                        function ( ShotIdList ) {
                        
                        if ( length(ShotIdList) > 0 ) {
                            
                            ShotIdList = unlist(ShotIdList)
                            ShotIdList = ShotIdList[!is.na(ShotIdList)]
                            ShotIdList = list(ShotIdList)
                            
                        }
                        
                        ShotIdList
                        }
                    )
                ]
                
                dtBallMoveGoalProbability[,
                    GoalIds := sapply(
                        GoalIds,
                        function ( GoalIdList ) {
                        
                        if ( length(GoalIdList) > 0 ) {
                            
                            GoalIdList = unlist(GoalIdList)
                            GoalIdList = GoalIdList[!is.na(GoalIdList)]
                            GoalIdList = list(GoalIdList)
                            
                        }
                        
                        GoalIdList
                        }
                    )
                ]

            }

            
        } else {
            
            dtBallMoveGoalProbability = data.table(
                Count = 0,
                event = unique(dtBallMoveEventsForThisXY[, event])
            )
            
        }
        
        dtBallMoveGoalProbability
    
    }


    fPredictOneCoordinatexPo = function (
        x1,
        y1,
        dtProbabilities
    ) {
        
        nCalculationResolution = dtProbabilities[, diff(sort(unique(x)))]
        nCalculationResolution = min(nCalculationResolution[nCalculationResolution > 0])
        
        dtNearbyShotProbabilities = dtProbabilities[
            ( x - ( nCalculationResolution / 2 ) ) <= x1 &
            ( x + ( nCalculationResolution / 2 ) ) > x1 &
            ( y - ( nCalculationResolution / 2 ) ) <= y1 &
            ( y + ( nCalculationResolution / 2 ) ) > y1
        ]
            
        if ( nrow(dtNearbyShotProbabilities) == 0 ) {
            
            nProbability =  NA
            
        } else {
            
            
            nProbability =  dtNearbyShotProbabilities[, xPo]
            
        }
        
        nProbability
    
    }


    fPredictTwoCoordinatexPo = function (
        x1,
        y1,
        x2,
        y2,
        dtProbabilities,
        getxG = T
    ) {
        
        nCalculationResolution = dtProbabilities[, diff(sort(unique(x)))]
        nCalculationResolution = min(nCalculationResolution[nCalculationResolution > 0])
        
        dtNearbyBallRunsProbabilities = dtProbabilities[
            ( x - ( nCalculationResolution / 2 ) ) <= x1 &
            ( x + ( nCalculationResolution / 2 ) ) > x1 &
            ( y - ( nCalculationResolution / 2 ) ) <= y1 &
            ( y + ( nCalculationResolution / 2 ) ) > y1
        ][
            ( endX - ( nCalculationResolution / 2 ) ) <= x2 &
            ( endX + ( nCalculationResolution / 2 ) ) > x2 &
            ( endY - ( nCalculationResolution / 2 ) ) <= y2 &
            ( endY + ( nCalculationResolution / 2 ) ) > y2
        ]
            
        if ( nrow(dtNearbyBallRunsProbabilities) == 0 ) {
            
            nProbability =  NA
            
        } else {
            
            
            if ( getxG ) {
                nProbability =  dtNearbyBallRunsProbabilities[, xPo]
            } else {
                nProbability =  dtNearbyBallRunsProbabilities[, WeightedGoals]
            }
            
        }
        
        nProbability
    
    }

    # if there are multiple shots, then do the p + ( ( 1- p ) * ... ) business
    # to compress it into one xG value
    fCompoundProbabilities = function( 
        vnProbabilities 
    ) {
        
        if ( length(vnProbabilities) > 1 ) {
            
            vnProbabilities = vnProbabilities[1] + 
                ( 
                    ( 1 - vnProbabilities[1] ) * fCompoundProbabilities( vnProbabilities[-1] )
                )
            
        }
        
        vnProbabilities
    
    }


}









################################################################################
# Loading data and basic preprocessing
################################################################################

if ( T ) { 

    # Loading just the high level details of the match, who was the opponenty, etc.
    lMatches = fromJSON(
        paste(
            readLines(
                    cSeasonFilePath
            ),
            collapse = ' '
        )
    )

    dtMatches = rbindlist(
        lapply(
            lMatches, 
            function( lMatch ) { data.table(t(unlist(lMatch))) } 
        ), 
        fill = T
    )

    vcMatchFileNames = paste0(
        cDataRepoPath,
        '/data/events/',
        sapply(lMatches, function( x ) x$match_id),
        '.json'
    )



    # Loading event data for each match
    lMatchesData = lapply(
        vcMatchFileNames,
        function ( cMatchFileName ) {

            print(
                paste0('Reading ', cMatchFileName)
            )
                
            lMatchJson = fromJSON(file = cMatchFileName)
        
            lEvents = fJsonToListOfTables (
                lMatchJson,
                vcTagsToExtract,
                nXLimit = nXLimit,
                nYLimit = nYLimit
            ) 
            
            lEvents = lapply(
                lEvents,
                function ( dtEvents ) {
                    
                    dtEvents[, 
                        match_id := gsub(
                            x = gsub(
                                x = cMatchFileName,
                                pattern = '\\.json',
                                replacement = ''
                            ),
                            pattern = '.*\\/',
                            replacement = ''
                        )
                    ]
                    
                }
            )
            
            lEvents
            
        }
        
    )

    names(lMatchesData) = gsub(
        x = gsub(
            x = vcMatchFileNames,
            pattern = '\\.json',
            replacement = ''
        ),
        pattern = '.*\\/',
        replacement = ''
    )

    # removing events which happened when the formation wasn't the selected
    # formation
    if ( !is.null(cFormationToAnalyse) )  {


        lMatchesData = lMatchesData[
            rbindlist(lapply(
                lMatchesData,
                function(x) x$Starting.XI[
                    team.id %in% 217
                ][
                    1, 
                    list(match_id, team.id, tactics.formation)
                ]
            ))[
                tactics.formation == cFormationToAnalyse,
                match_id
            ]
        ]

        # this aggressively removes all events that happened after the first
        # instance of the formation being different from the specified one
        # If the team returns to that formation afterwards, that data also gets
        # chopped out
        lMatchesData = lapply(
            lMatchesData, 
            function(lMatchData) {

                dtTacticalShift = data.table()

                if ( !is.null(lMatchData$Tactical.Shift) ) {
                    if ( nrow(lMatchData$Tactical.Shift) > 0 ) {
                        dtTacticalShift = lMatchData$Tactical.Shift[
                            team.id == 217
                        ][
                            tactics.formation != cFormationToAnalyse
                        ]
                    }
                }

                if ( nrow( dtTacticalShift ) > 0 ) {


                    dtTacticalShift = dtTacticalShift[
                        which.min(index)
                    ]

                    dtTacticalShift = dtTacticalShift[which.min(index)]

                    lMatchData$Pass = lMatchData$Pass[
                        index <= dtTacticalShift[, index]
                    ]

                    lMatchData$Carry = lMatchData$Carry[
                        index <= dtTacticalShift[, index]
                    ]

                    lMatchData$Shot = lMatchData$Shot[
                        index <= dtTacticalShift[, index]
                    ]

                }

                lMatchData

            }
        )

    }

    # Finding out which player was playing in which position at which point of
    # time, we'll need that for the player level xPo calculations
    if ( T ) {

        dtTactics = rbindlist(lapply(
            lMatchesData, 
            function(lMatchData) {

                dtTacticalShift = data.table()

                if ( !is.null(lMatchData$Tactical.Shift) ) {
                    if ( nrow(lMatchData$Tactical.Shift) > 0 ) {
                        dtTacticalShift = lMatchData$Tactical.Shift
                    }
                }

                dtTacticalShift

            }
        ))

        dtTactics = rbindlist(
            lapply(
                1:11,
                function(x) {

                    if ( x == 1 ) {
                        x = '$'
                    } else {
                        x = paste0('.', formatC(x, width = 2, flag = '0'))
                    }

                    dtTacticsRow = dtTactics[,
                        c(
                            'match_id',
                            'team.id',
                            'index',
                            grep(
                                colnames(dtTactics),
                                pattern = paste0(
                                    'position.id', x,
                                    '|',
                                    'player.id', x
                                ),
                                value = T
                            )
                        ),
                        with = F
                    ]

                    setnames(
                        dtTacticsRow,
                        c('matchId','teamId','eventSequence','playerId','positionId')
                    )
                }

            ),
            fill = T
        )

        dtTactics = rbind(
            rbindlist(
                lapply(
                    lMatchesData,
                    function( lMatchData ) {
                        lMatchData$Starting.XI[,
                            list(
                                matchId = match_id, 
                                teamId = team.id, 
                                eventSequence = index, 
                                positionId = position.id, 
                                playerId = player.id
                            )
                        ]
                    }
                )
            ),
            dtTactics
        )

        dtTactics = rbind(
            rbindlist(
                lapply(
                    lMatchesData,
                    function( lMatchData ) {
                        lMatchData$Substitution[, list(matchId = match_id, teamId = team.id, eventSequence = index, playerId = substitution.replacement.id, positionId = position.id)]
                    }
                )
            ),
            dtTactics,
            fill = T
        )

        # hardcoded. some issue with the events data where the player appears
        # in a formation before the substituion
        dtTactics = dtTactics[
            !(
                matchId == 69222 &
                eventSequence %in% c(2666,2668)
            )
        ]

        dtTactics[, eventSequence := as.integer(eventSequence)]

        dtTactics = dtTactics[
            order(eventSequence),
            list(
                startEventSequence = c( 0, eventSequence),
                endEventSequence = c( eventSequence, 99999),
                playerId = c(playerId[which.min(eventSequence)], playerId)
            ),
            list(
                matchId,
                teamId,
                positionId
            )
        ]

        dtTactics = rbind(
            dtTactics[endEventSequence != 99999],
            merge(
                dtTactics[endEventSequence == 99999][, endEventSequence := NULL],
                rbindlist(
                    lapply(
                        lMatchesData, 
                        function (lMatchData) {

                            dtTimeIndex = rbind(
                                # lMatchData$Pass[which.max(index), list(matchId = match_id, endEventSequence = index)] 
                                lMatchData$Starting.XI[which.max(index),     list(matchId = match_id, endEventSequence = index)],
                                lMatchData$Pass[which.max(index),            list(matchId = match_id, endEventSequence = index)],
                                lMatchData$Carry[which.max(index),           list(matchId = match_id, endEventSequence = index)],
                                lMatchData$Shot[which.max(index),            list(matchId = match_id, endEventSequence = index)]
                            )

                            if ( !is.null(lMatchData$Substitution) ) {

                                dtTimeIndex = rbind(
                                    lMatchData$Substitution[which.max(index),  list(matchId = match_id, endEventSequence = index)],
                                    dtTimeIndex
                                )

                            }

                            if ( !is.null(lMatchData$Tactical.Shift) ) {

                                dtTimeIndex = rbind(
                                    lMatchData$Tactical.Shift[which.max(index),  list(matchId = match_id, endEventSequence = index)],
                                    dtTimeIndex
                                )

                            }
                            
                            dtTimeIndex[
                                which.max(endEventSequence)
                            ]

                        } 
                    )
                ),
                'matchId'
            )
        )

        dtTactics = dtTactics[, lapply(.SD, as.integer)]

    }


    # Getting human readable names for each position ID
    if ( T ) {

        dtPositionNames = lMatchesData[[1]]$Starting.XI[, 
            list(
                positionName = position.name, 
                positionId = position.id
            )
        ]
        dtPositionNames[, positionName := gsub(positionName, pattern = ' ', replacement = '')]
        dtPositionNames[, positionName := gsub(positionName, pattern = paste0(letters, collapse = '|'), replacement = '')]
        dtPositionNames[positionName == 'G', positionName := 'GK' ]

    }


}







################################################################################
# xPo calculation code
################################################################################

if ( T ) {


    if ( is.null(cPositionId) ) {

        cFolder = 'Team'

    } else {

        # cFolder = dtPositionNames[
        #     positionId == cPositionId,
        #     positionName
        # ]
        cFolder = cPositionId

    }

    # Removing carries of lesser than nMinMoveDistance
    lMatchesData = lapply(
        lMatchesData, 
        function(lMatchData) {        

            lMatchData$Carry = lMatchData$Carry[  
                nMinMoveDistance <= fEuclideanDistance(
                     location1, location2, carry.end_location1, carry.end_location2
                )
            ]

            lMatchData
        }
    )



    # We will calculate a total xpo generated but it's better to look
    # at a p90 number so keeping track of time played
    # todo fix this to work for all arguments

    if ( T ) {
            
        dtTimePlayed = dtTactics
        
        if ( !is.null(cPositionId) ) {
            
            dtTimePlayed = dtTimePlayed[
                positionId == cPositionId
            ]

        } else {

            dtTimePlayed = dtTimePlayed[,
                list(
                    startEventSequence = min(startEventSequence),
                    endEventSequence = max(endEventSequence)
                ),
                list(
                    matchId,
                    teamId
                )
            ]

        }

        if ( cTag == 'For' ) {
            
            dtTimePlayed = dtTimePlayed[
                teamId == cTeamId
            ]

        } else {

            
            dtTimePlayed = dtTimePlayed[
                teamId != cTeamId
            ]

        }

        dtUniversalTimeIndex = rbindlist(lapply(
            lMatchesData,
            function( lMatchData ) {
                rbind(
                    lMatchData$Starting.XI[,     list(index, minute, second)],
                    lMatchData$Pass[,            list(index, minute, second)],
                    lMatchData$Carry[,           list(index, minute, second)],
                    lMatchData$Shot[,            list(index, minute, second)],
                    lMatchData$Tactical.Shift[,  list(index, minute, second)],
                    lMatchData$Substitution[,    list(index, minute, second)]
                )[, 
                    Time := ( as.numeric(minute) * 60 ) + as.numeric(second)][,
                    c('minute','second') := NULL
                ][,
                    matchId := lMatchData$Pass[1, match_id]
                ]
            }
        ))
        
        dtUniversalTimeIndex = dtUniversalTimeIndex[, lapply(.SD, as.integer)]
        dtUniversalTimeIndex = dtUniversalTimeIndex[, .SD[1], list(matchId, index)]

        dtTimePlayed = merge(
            dtTimePlayed,
            dtUniversalTimeIndex[, list(startEventSequence = index, matchId, Time)],
            c('startEventSequence','matchId'),
            all.x = T
        )

        dtTimePlayed = merge(
            dtTimePlayed,
            dtUniversalTimeIndex[, list(endEventSequence = index, matchId, Time)],
            c('endEventSequence','matchId'),
            all.x = T
        )

        dtTimePlayed[startEventSequence == 0, Time.x := 0]

        dtTimePlayed[, TimePlayed := Time.y - Time.x]
        dtTimePlayed[, c('Time.y','Time.x') := NULL]

        dtTimePlayed = dtTimePlayed[, list(TimePlayed = sum(TimePlayed)), list(matchId, teamId)]

        dir.create(
            paste0(        
                cOutputPath,
                '/Data/',
                # dtTeam[teamId == cTeamId, teamName],
                cTeamId,
                '/TimePlayed/',
                cTag
            ),
            recursive = T,
            showWarnings = F
        )

        cTimePlayedFile = paste0(
            cOutputPath,
            '/Data/',
            # dtTeam[teamId == cTeamId, teamName],
            cTeamId,
            '/TimePlayed/',
            cTag,
            '/',
            cFolder,
            '.Rdata'
        )

        save(
            list = 'dtTimePlayed',
            file = cTimePlayedFile
        )

    }




    cShotsXPOPath = paste0(
        cOutputPath,
        '/Data/',
        # dtTeam[teamId == cTeamId, teamName],
        cTeamId,
        '/Shots/',
        cTag,
        '/',
        cFolder,
        '.Rdata'
    )

    # shot goal prob
    # you can extend this code to other one coordinate events too
    # but you will need to figure out how to get the goal probability from
    # that possession attached to the event. We don't have to do that for
    # shots since shots are already labelled with the goal probability
    if ( !file.exists(cShotsXPOPath) ) {

        dtShots = rbindlist(
            lapply(
                lMatchesData,
                function( lMatchData ) {
                                
                    lMatchData$Shot[,
                        list(
                            matchId = match_id,
                            teamId = team.id,
                            positionId = position.id,
                            isGoal = shot.outcome.name == 'Goal',
                            x = as.numeric(location1),
                            y = as.numeric(location2),
                            shotId = id,
                            playId = possession,
                            eventSequence = as.integer(index),
                            GoalProbability = as.numeric(shot.statsbomb_xg)
                        )
                    ]

                }
            )
        )



        dir.create(
            gsub(x = cShotsXPOPath, pattern = '(.*)/.*', replacement = '\\1'),
            showWarnings = F,
            recursive = T
        )

        dtShotProbabilities = rbindlist(
            lapply(
                seq(0, nXLimit, 1),
                function ( x1 ) {
                
                dtShotGoalProbability = rbindlist(
                    lapply(
                        seq(0, nYLimit, 1),
                        function ( y1 ) {

                            if ( cTag == 'For' ) {
                            
                                dtShotsSubset = dtShots[teamId == cTeamId]

                            } else if ( cTag == 'Against' ) {
                                
                                dtShotsSubset = dtShots[teamId != cTeamId]

                            }
                            
                            if ( !is.null(cPositionId) ) {
                            
                                dtShotsSubset = dtShotsSubset[ positionId == cPositionId ]
                            
                            }
                            
                            dtShotGoalProbability = fCalculateOneCoordinatexPo (
                                dtShotsSubset,
                                x1,
                                y1,
                                sdRadial = nOnePointsSDRadial,
                                nZBoundary = nZBoundary
                            )[
                                Count > 0
                            ]
                            
                            if ( nrow(dtShotGoalProbability) > 0 ) {
                                dtShotGoalProbability[,
                                    y := y1
                                ]
                            }

                            dtShotGoalProbability
                            
                        }
                    ),
                    fill = T
                )
                
                
                if ( nrow(dtShotGoalProbability) > 0 ) {
                    
                    dtShotGoalProbability[,
                        x := x1
                    ]
                    
                }
                
                dtShotGoalProbability
                
                }
            ),
            fill = T
        )

        save(
            list = 'dtShotProbabilities',
            file = cShotsXPOPath
        )

    }


    # Pass and carry goal prob
    if ( T ) {

        dtBallMoveEvents = rbindlist(
            lapply(
                lMatchesData,
                function( lMatchData ) {

                    rbind(

                        lMatchData$Pass[,
                            list(
                                matchId = match_id,
                                teamId = team.id,
                                positionId = position.id,
                                playId = possession,
                                x = as.numeric(location1),
                                y = as.numeric(location2),
                                endX = as.numeric(pass.end_location1),
                                endY = as.numeric(pass.end_location2),
                                eventSequence = as.integer(index),
                                event = 'Pass'
                            )
                        ],

                        lMatchData$Carry[,
                            list(
                                matchId = match_id,
                                teamId = team.id,
                                positionId = position.id,
                                playId = possession,
                                x = as.numeric(location1),
                                y = as.numeric(location2),
                                endX = as.numeric(carry.end_location1),
                                endY = as.numeric(carry.end_location2),
                                eventSequence = as.integer(index),
                                event = 'Run'
                            )
                        ]

                    )

                }
            )
        )

        
        cFinalFolder = paste0(
            cOutputPath,
            '/Data/',
            # dtTeam[teamId == cTeamId, teamName],
            cTeamId,
            # '/Pass',
            '/',
            cTag,
            '/',
            cWhatIsBeingMeasured,
            '/',
            # '/PassAgainst/',
            cFolder
        )


        dir.create(
            cFinalFolder,
            showWarnings = F,
            recursive = T
        )

        dtBallMoveGoalProbability = rbindlist(
            lapply(
                seq(nXLimit, 0, -nCalculationResolution),
                function ( x1 ) {

                    print(x1)
                    print(Sys.time())

                    # x1 = 90; y1 = 10
                    # x1 = 12; y1 = 32


                    sfInit(cpus = iCoresToParalleliseOver, parallel = T)
                    # sfExport('dtBallMoveEventsForThisXY')
                    sfExport('dtBallMoveEvents')
                    sfExport('fCalculateTwoCoordinatexPo')
                    sfExport('dtShots')
                    sfExport('nTwoPointsSDRadial')
                    sfExport('x1')
                    sfExport('nXLimit')
                    sfExport('nYLimit')
                    sfExport('cTeamId')
                    sfExport('cPositionId')
                    sfExport('nCalculationResolution')
                    sfExport('nZBoundary')
                    sfExport('fCompoundProbabilities')
                    sfExport('cFinalFolder')
                    sfExport('cTag')
                    sfExport('cWhatIsBeingMeasured')
                    sfLibrary(data.table)
                    
                    
                    dtBallMoveGoalProbability = rbindlist(
                        # lapply(
                        sfLapply(
                            seq(0, nYLimit, nCalculationResolution),
                            # 63,
                            function ( y1 ) {
                                
                                print('x1')
                                print(x1)
                                
                                print('y1')
                                print(y1)

                                print(Sys.time())
                                
                                cThisCoordinateXPOFilepath = paste0(
                                    cFinalFolder,
                                    '/x',
                                    formatC(x1, width = 3, flag = '0'),
                                    '_y',
                                    formatC(y1, width = 3, flag = '0'),
                                    '.Rdata'
                                )
                                
                                if ( file.exists(cThisCoordinateXPOFilepath)) {
                                    
                                    print('file exists')
                                    print(cThisCoordinateXPOFilepath)
                                    load(cThisCoordinateXPOFilepath)
                                    
                                } else {
                            
                                    # getting the appropriate subset of events
                                    # or this itertaion
                                    dtBallMoveEventsForThisXY = dtBallMoveEvents[
                                        abs(x - x1) < ( nZBoundary * nTwoPointsSDRadial )
                                    ][
                                        
                                        abs(y - y1) < ( nZBoundary * nTwoPointsSDRadial )
                                    ][
                                        ( 
                                            (
                                            ( ( x - x1 ) ^ 2 ) +
                                            ( ( y - y1 ) ^ 2 )
                                            ) ^ 0.5 
                                        ) <= ( nZBoundary * nTwoPointsSDRadial)
                                    ]


                                    if ( cWhatIsBeingMeasured == 'Scoring' ) {
                                        
                                        if ( cTag == 'For' ) {
                                        
                                            dtBallMoveEventsForThisXY = dtBallMoveEventsForThisXY[teamId == cTeamId]

                                        } else if ( cTag == 'Against' ) {
                                            
                                            dtBallMoveEventsForThisXY = dtBallMoveEventsForThisXY[teamId != cTeamId]

                                        }

                                    } else if ( cWhatIsBeingMeasured == 'Conceding' ) {

                                        if ( cTag == 'For' ) {
                                        
                                            dtBallMoveEventsForThisXY = dtBallMoveEventsForThisXY[teamId == cTeamId]
                                            dtBallMoveEventsForThisXY[, playId := playId + 1]

                                        } else if ( cTag == 'Against' ) {
                                            
                                            dtBallMoveEventsForThisXY = dtBallMoveEventsForThisXY[teamId != cTeamId]

                                        }

                                    }

                                    if ( !is.null(cPositionId) ) {

                                        dtBallMoveEventsForThisXY = dtBallMoveEventsForThisXY[positionId == cPositionId]
                                        
                                    }

                                    if ( nrow(dtBallMoveEventsForThisXY) > 0 ) {
                                        
                                        # the code will loop over x1, y1 and process for all
                                        # x2, y2 in one go
                                        dtBallMoveGoalProbability = rbindlist(
                                            lapply(
                                            # sfLapply(
                                                seq(nXLimit, 0, -nCalculationResolution),
                                                function ( x2 ) {                                                    
                                                    

                                                    dtBallMoveGoalProbability = rbindlist(
                                                        lapply(
                                                            seq(0, nYLimit, nCalculationResolution),
                                                            function ( y2 ) {

                                                                dtBallMoveGoalProbability = copy(dtBallMoveEventsForThisXY)[
                                                                    (
                                                                        ( ( x - x1 ) ^ 2 ) +
                                                                        ( ( y - y1 ) ^ 2 )
                                                                    ) ^ 0.5 < ( nZBoundary * nTwoPointsSDRadial )
                                                                ][
                                                                    (
                                                                        ( ( endX - x2 ) ^ 2 ) +
                                                                        ( ( endY - y2 ) ^ 2 )
                                                                    ) ^ 0.5 < ( nZBoundary * nTwoPointsSDRadial )
                                                                ]

                                                                dtBallMoveGoalProbability[,
                                                                    y2 := y2
                                                                ]

                                                                dtBallMoveGoalProbability                                                        
                                            
                                                            }
                                                        ),
                                                        fill = T
                                                    )
                                                    
                                                    
                                                    if ( nrow(dtBallMoveGoalProbability) > 0 ) {
                                                        
                                                        dtBallMoveGoalProbability[,
                                                            x2 := x2
                                                        ]
                                                        
                                                    }
                                                    
                                                    dtBallMoveGoalProbability
                                                    
                                                }
                                            ),
                                            fill = T
                                        )


                                        if ( nrow(dtBallMoveGoalProbability) > 0 ) {
                                        
                                            dtBallMoveGoalProbability[,
                                                y1 := y1
                                            ]
                                            dtBallMoveGoalProbability[,
                                                x1 := x1
                                            ]
                                            
                                            dtBallMoveGoalProbability = fCalculateTwoCoordinatexPo (
                                                dtBallMoveGoalProbability,
                                                dtShots,
                                                sdRadial = 3.33,
                                                nZBoundary = 4
                                            )

                                            setnames(
                                                dtBallMoveGoalProbability,
                                                c('x1','y1','x2','y2'),
                                                c('x','y','endX','endY')
                                            )

                                        } else {

                                            dtBallMoveGoalProbability = data.table()

                                        }

                                    } else {

                                        dtBallMoveGoalProbability = data.table()

                                    }

                                    save(
                                        list = 'dtBallMoveGoalProbability',
                                        file = cThisCoordinateXPOFilepath
                                    )
                                    
                                }
                                
                                NULL
                        
                            }
                        ),
                        fill = T
                    )

                    sfStop()
                    
                    NULL
                    
                }
            ),
            fill = T
        )

        # it is just nulls, can be removed
        rm(dtBallMoveEvents)

    }


}










################################################################################
# xPo visualistin code
################################################################################

if ( T ) {

    load(
        sample(
            list.files(
                paste0(
                    cOutputPath, '/',
                    'Data/',
                    cTeamId, '/',
                    cTag, '/',
                    cWhatIsBeingMeasured, '/',
                    cFolder
                ),
                full.names = T,
                recursive = T
            ),
            1
        )
    )

    p1 = ggplot(
        dtBallMoveGoalProbability[
            event == 'Pass'
        ]
    ) +
        geom_tile(
            aes(
                x = endX,
                y = endY,
                fill = xPo
            )
        ) + 
        geom_text(
            data = dtBallMoveGoalProbability[1],
            aes(
                x = x,
                y = y,
                label = 'Origin'
            ),
            color = 'red',
            vjust = 2
        ) + 
        geom_point(
            data = dtBallMoveGoalProbability[1],
            aes(
                x = x,
                y = y
            ),
            color = 'red',
            size = 5
        ) + 
        ggtitle(
            paste0(
                'xPo of pass at receiving coordinates, originating from ',
                dtBallMoveGoalProbability[1, paste(x, y)]
            )
        )

    p1 = fAddPitchLines(
        plotObject = p1,
        nXLimit = nXLimit,
        nYLimit = nYLimit,
        cLineColour = 'white',
        cPitchColour = NA
    )

    print(p1)



    p2 = ggplot(
        dtBallMoveGoalProbability[
            event == 'Pass'
        ]
    ) +
        geom_tile(
            aes(
                x = endX,
                y = endY,
                fill = WeightedExpectedGoals / dtTimePlayed[, 90 * 60 / sum(TimePlayed, na.rm = T)]
            )
        ) + 
        geom_text(
            data = dtBallMoveGoalProbability[1],
            aes(
                x = x,
                y = y,
                label = 'Origin'
            ),
            color = 'red',
            vjust = 2
        ) + 
        geom_point(
            data = dtBallMoveGoalProbability[1],
            aes(
                x = x,
                y = y
            ),
            color = 'red',
            size = 5
        ) + 
        ggtitle(
            paste0(
                'Total xPo generated p90 at receiving coordinates, originating from ',
                dtBallMoveGoalProbability[1, paste(x, y)]
            )
        )

    p2 = fAddPitchLines(
        plotObject = p2,
        nXLimit = nXLimit,
        nYLimit = nYLimit,
        cLineColour = 'white',
        cPitchColour = NA
    )

    print(p2)

}