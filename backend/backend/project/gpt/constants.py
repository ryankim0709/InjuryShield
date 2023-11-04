RESPONSE_TOKEN_LIMIT = 1024
DEFAULT_GPT_MODEL = "gpt-3.5-turbo"
DEFAULT_INSIGHT_INSTRUCTION = (
    'Provide a 3-sentence summary of the included transcript.\n'
    '- The first sentence summarizes the overall workload of the training.\n'
    '- The second sentence summarizes details and key training.\n'
    '- The third sentence summarizes the progress and achievement of the training.\n'
    '- The sentences should avoid phrases like "Here is a 3 sentence summary of the raining", "First Sentence", "Second Sentence", "Third Sentence"'
)
EXAMPLE_INSIGHT = (
    'Example of a good insight: \nYou have worked out for the past seven days with strength and distance training.'
    'You have run more than 50 miles over the past 7 days, and 3 days of strength training with no indication of injuries.'
    'In particular, your long distance (greater than 10 miles) was very effective to boost overall efficiency of the body, and'
    'make you well prepared for this meet!'
)

EXAMPLE_COACHING_SUMMARY = (
    'Great work, Ryan! Your frequent runs and healthy lifestyle are doing wonders to safeguard against injury.'
    'The low risk prediction from your training pattern is promising. To evolve further, gradually increase your workouts\' intensity, ' 
    'take adequate rest, and pay attention to your body\'s needs. Infusing strength training could be a game-changer '
    'for better performance. Keep moving forward, Ryan. You\'re doing terrific!'
)

COACHING_SUMMARY_INSTRUCTION = (
    '1. Review the provided summaries and records carefully.\n'
    '2. Create the overall summary in one paragraph:\n'
    'a. Please start with motivating phrases like "Great Job, <user>" and end with phrases like "Keep it up, <user>"\n'
    'b. Please provide clear justification\n'
    '3. Provide key statistics from training records as follows:\n'
    'a. Total number of running mileage\n'
    'b. Total number of strength exercises\n'
    'c. Average recovery level in percentage\n'
    '4. Provide the summary of training record creation patterns based on dates.\n'
    'a. Comment on how many and often user documents the records.\n'
    'b. Comment on how thoroughly all fields in the record got documented.\n'
    '5. Output only a RFC8259 compliant JSON response, following this format without devication:\n'
    '[{"coaching_summary": {"summary: "String representing the overall summary of the provided summary"},'
    '"statistics": {"mileage": <total mileage>, "strength": <total number of strength exercises>, "recovery": <recovery level>},'
    '"diary": {"summary": "String representing the summary of training record patterns", "dates": <list of dates for the recent records up to 10>}}]'
)

MULTIPLE_INSIGHT_INSTRUCTION = (
    '1. Review the provided logs carefully.\n' 
    '2. Create the following summaries:\n'
    'a. Overall running performance of person\'s training over the past 7 days.\n' 
    'b. Injuries history or assessment based on person\'s training history.\n'
    'c. Emotion state based on stress, anxiety and recovery levels.\n' 
    'd. Any recent trends in the above categories such as improving, declining, or steady.  Please suggest anything to improve for his running performance.\n' 
    'e. Combine and summarize the overall running performance, the injury assessment, the emotion state and any the recent trends in three concise sentences.\n'
    '3. Summaries can be as long as you need them to properly convey enough data.\n'
    '4. If a specific summary doesn\'t apply to the training logs, do not generate that summary.\n' 
    '5. Output a RFC8259 compliant JSON response, following this format without deviation:\n'
    '[{"running_summary": {"summary": "String representing the summary of the overall running performance},'
    '"injury_assessment": {"summary": "String representing the summary of any injury risk"},'
    '"emotion_state": {"summary": "String representing the summary of person\'s emotion state},'
    '"trends_improvement": {"summary": "String representing the summary of recent training trends and anything to improve"},'
    '"overall_performance": {"summary": "String representing the summary of running, injury, emotion, and trend anaysis}]\n'
)

MULTIPLE_PREDICTION_INSTRUCTION = (
    '1. Review and understand the provided training records for the Elite runner as a reference.\n' 
    '2. Review the provided training records for the user and compare it with the rcords of the Elite runner.\n'
    '3. Make the following predictions and suggestions for the user:\n'
    'a. Predict injury risk or prediction of the user, if the user continues the same or similar workout program for the next 7 days.\n' 
    'b. Suggest three methods to avoid or minimize injury, based on the user training records.\n'
    'c. Suggest running schedule of th user forthe next 7 days day-by-day.\n'
    'd. Suggst Strength training schedule of the user for the next 7 days day-by-day.\n'
    'e. Predict the fatigue level of the user for the next 7 days day-by-day.\n'
    '3. Predictions can be as long as you need them to properly convey enough data with a data-based justification.\n'
    '4. If a specific pediction doesn\'t apply to the training records, do state "not eough data".\n' 
    '5. Output a RFC8259 compliant JSON response, following this format without deviation:\n'
    '[{"injury_prediction": {"prediction": "String representing the prediction of the risk risk or probability", "summary": "String justifying the injury prediction with some statistics"},'
    '"injury_avoidance": {"<keywords of the suggestion>": "String representing the suggestion to minimize injury risk", ...},'
    '"daily_schedule": {"day-<x>": {"distance": <x> mile, "strength": <yes|no>, "fatigue": <none|mild|moderate|serious>, "justification": "String justifying the schedule},...}]\n'
)