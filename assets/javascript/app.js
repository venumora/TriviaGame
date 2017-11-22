(function() {
	const MAX_START_COUNTER = 3,
	MAX_QUESTION_COUNTER = 30;
	let MAX_QUESTIONS = 5;

	let assessment = function() {
		this.count = MAX_START_COUNTER;
		this.counter = null;
		this.questions = [];
		this.presentedQuestions = [];
		this.currentQuestion = null;
		this.correct = 0;
		this.wrong = 0;

		assessment.prototype.startTest = function(isReset) {
			if(isReset) {
				this.count = MAX_START_COUNTER;
				this.counter = null;
				this.questions = [];
				this.presentedQuestions = [];
				$('#result').hide();
				$('#assessmentPlayerWrapper').hide();
				$('#correctBar').empty().css({'width': '0%'}).attr({'aria-valuenow': 0});
				$('#wrongBar').empty().css({'width': '0%'}).attr({'aria-valuenow': 0});

				$.getJSON("https://api.myjson.com/bins/7n353", function( data ) {
					this.questions = data;
					if(MAX_QUESTIONS > data.length) {
						MAX_QUESTIONS = data.length;
					}
				}.bind(this));
			}

			$('button[role="reset"]').unbind('click').on('click', this.startTest.bind(this, true));

			if(MAX_QUESTIONS > this.presentedQuestions.length) {
				$('#countDown').show();
				if(isReset) {
					$('#countDown').text(`Get Ready!!`);
				} else {
					$('#countDown').text(`Next question in ${MAX_START_COUNTER} secs!!`);
				}
				$('#progressbar').removeClass('progress-bar-danger')
				.removeClass('progress-bar-danger');
				this.count = MAX_START_COUNTER;
				this.counter = setInterval(this.startTestCounter.bind(this), 1000);
			} else {
				$('#assessmentPlayer').empty();
				$('#assessmentPlayerWrapper').show();
				let cWidth = (this.correct / MAX_QUESTIONS) * 100,
				wWidth =  (this.wrong / MAX_QUESTIONS) * 100;
				$('#correctBar').css({'width': `${cWidth}%`}).attr({'aria-valuenow': cWidth})
				.text(`${this.correct}/${MAX_QUESTIONS} correct`);

				$('#wrongBar').css({'width': `${wWidth}%`}).attr({'aria-valuenow': wWidth})
				.text(`${this.wrong}/${MAX_QUESTIONS} wrong`);

				$('#correct').text(`You got ${this.correct} correct out of ${MAX_QUESTIONS}.`);
				$('#wrong').text(`You got ${this.wrong} wrong out of ${MAX_QUESTIONS}.`);
				$('#message').text('You are awesome!!');
				$('#result').show();
			}
		};

		assessment.prototype.startTestCounter = function() {
			$('#countDown').text(`Next question in ${this.count} ${ this.count > 1 ? 'secs' : 'sec'}!!`);
			if(this.count === 0) {
				this.clearCounter();
				if(this.questions.length) {
					$('#countDown').hide();
					this.showQuestion();
				}
			}
			this.count--;
		};

		assessment.prototype.clearCounter = function() {
			if(this.counter) {
				clearInterval(this.counter);
				this.counter = null;
			}
		};

		assessment.prototype.startQuestionCounter = function() {
			let pWidth = ((MAX_QUESTION_COUNTER - this.count) / MAX_QUESTION_COUNTER) * 100;
			$('#progressbar').css({'width': `${pWidth}%`}).attr({'aria-valuenow': pWidth})
			.text(`${this.count} ${ this.count > 1 ? 'secs' : 'sec'} remaining!!`);

			if (this.count <= MAX_QUESTION_COUNTER * 2 / 3) {
				$('#progressbar').addClass('progress-bar-warning');
			}
			if (this.count <= MAX_QUESTION_COUNTER / 3) {
				$('#progressbar').addClass('progress-bar-danger');
			}

			if(this.count === 0) {
				this.clearCounter();
				this.checkAnswer();
			}
			this.count--;
		};

		assessment.prototype.showQuestion = function() {
			this.currentQuestion = this.getRandomQuestion();
			this.presentedQuestions.push(this.currentQuestion.id);
			this.count = MAX_QUESTION_COUNTER;
			let prompt = $('<h1>'), type = this.currentQuestion.type,
			checkAnswer = $('<button role="button" class="btn btn-primary">');
			checkAnswer.text('Submit').on('click', this.checkAnswer.bind(this));;

			prompt.text(this.currentQuestion.prompt.text);
			$('#assessmentPlayer').empty();
			$('#assessmentPlayer').append(prompt);
			this.currentQuestion.prompt.choices.forEach(function(choice){
				let currentChoice = choice.choice
				inputGroup = $('<div class="input-group">'),
				inputGroupAddOn = $('<span class="input-group-addon">'),
				inputLabel = $('<label class="form-control">'),
				inputControl = $('<input id="choice_1" type="radio" name="choices"/>');
				
				inputLabel.attr({for: `choice_${currentChoice.id}`}).text(currentChoice.text);
				inputControl.attr({
					id: `choice_${currentChoice.id}`,
					type: type === 'choice' ? 'radio' : 'checkbox',
					value: currentChoice.id
				});

				inputGroupAddOn.append(inputControl);
				inputGroup.append(inputGroupAddOn).append(inputLabel);
				$('#assessmentPlayer').append(inputGroup);
			});
			$('#assessmentPlayer').append(checkAnswer);
			$('#assessmentPlayerWrapper').show();
			this.counter = setInterval(this.startQuestionCounter.bind(this), 1000);
		};

		assessment.prototype.checkAnswer = function() {
			let correct = false, answer = this.currentQuestion.prompt.answer;
			this.clearCounter();
			if(this.currentQuestion.type === 'choice') {
				correct = $('input[name="choices"]:checked').val() === answer.toString();
			} else {
				let selectedCh = $('input[name="choices"]:checked');
				if(selectedCh.length === 0 || selectedCh.length !== answer.length) {
					correct = false;
				} else {
					$.each(selectedCh, function(ind, ele) {
						if (answer.indexOf(parseInt($(ele).val() === -1))) {
							correct = false;
							return;
						}
					});
				}
			}

			if (correct) {
				this.correct++;
			} else {
				this.wrong++;
			}

			$('#assessmentPlayerWrapper').hide();
			$('#progressbar').css({'width': '0%'}).attr({'aria-valuenow': 0});
			this.startTest(false);
		}

		assessment.prototype.getRandomQuestion = function() {
			if(this.questions.length) {
				let question = null, rand = Math.floor(Math.random() * this.questions.length);
				return this.questions.splice(rand,1)[0].question;
			}
		}
	}

	let assessmentObj = new assessment();
	assessmentObj.startTest(true);
})();