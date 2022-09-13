extern crate preventscripts_cool_library;

fn main() {
	use preventscripts_cool_library::recommendation_engine::*;
	use preventscripts_cool_library::Motivation::*;
	use preventscripts_cool_library::Survey;
	use preventscripts_cool_library::ChronicCondition::*;

	let potato = 78;
    println!("{} == GungHo: {}", GungHo, motivation(5, 5, 5, 5));
    println!("{} == Medium: {}", Medium, motivation(4, 4, 4, 4));
    println!("{} == Medium: {}", Medium, motivation(4, 5, 4, 5));
    println!("{} == Low: {}", Low, motivation(3, 3, 3, 4));
    println!("{} == Low: {}", Low, motivation(3, 3, 3, 3));
    println!("{} == LowAsshole: {}", Low, motivation(0, 0, 0, potato));


    let hypertension_guy = Survey { 
		bmi: 32, 
		self_reported_chronic: Hypertension, 
		is_smoker: false, 
		score0: 5, 
		score1: 5, 
		score2: 5, 
		score3: 5 
	};	
    println!("chronic condition survey says {} ", hypertension_guy);
	let surveys = [
		Survey {
			bmi: 32,
			self_reported_chronic: Hypertension,
			is_smoker: false,
			score0: 5,
			score1: 5,
			score2: 5,
			score3: 5
		},
		Survey {
			bmi: 29,
			self_reported_chronic: None,
			is_smoker: true,
			score0: 5,
			score1: 5,
			score2: 5,
			score3: 5
		},

		Survey {
			bmi: 15,
			self_reported_chronic: None,
			is_smoker: false,
			score0: 5,
			score1: 5,
			score2: 5,
			score3: 5
		},
		Survey {
			bmi: 32,
			self_reported_chronic: None,
			is_smoker: false,
			score0: 5,
			score1: 5,
			score2: 5,
			score3: 5
		},
		Survey {
			bmi: 24,
			self_reported_chronic: None,
			is_smoker: false,
			score0: 5,
			score1: 5,
			score2: 5,
			score3: 5
		},

		Survey {
			bmi: 25,
			self_reported_chronic: None,
			is_smoker: true,
			score0: 5,
			score1: 5,
			score2: 5,
			score3: 5
		},
		Survey {
			bmi: 32,
			self_reported_chronic: None,
			is_smoker: true,
			score0: 5,
			score1: 5,
			score2: 5,
			score3: 5
		},

		Survey {
			bmi: 32,
			self_reported_chronic: None,
			is_smoker: false,
			score0: 1,
			score1: 1,
			score2: 1,
			score3: 1
		},
		Survey {
			bmi: 32,
			self_reported_chronic: None,
			is_smoker: false,
			score0: 4,
			score1: 5,
			score2: 5,
			score3: 5
		},
		Survey {
			bmi: 32,
			self_reported_chronic: None,
			is_smoker: false,
			score0: 4,
			score1: 4,
			score2: 5,
			score3: 5
		},
		Survey {
			bmi: 32,
			self_reported_chronic: None,
			is_smoker: false,
			score0: 4,
			score1: 5,
			score2: 5,
			score3: 5
		},
		Survey {
			bmi: 32,
			self_reported_chronic: None,
			is_smoker: false,
			score0: 0,
			score1: 0,
			score2: 5,
			score3: 5
		},

		Survey {
			bmi: 25,
			self_reported_chronic: None,
			is_smoker: false,
			score0: 5,
			score1: 5,
			score2: 4,
			score3: 4
		},
		Survey {
			bmi: 25,
			self_reported_chronic: Hypertension,
			is_smoker: false,
			score0: 5,
			score1: 5,
			score2: 4,
			score3: 4
		},
		Survey {
			bmi: 25,
			self_reported_chronic: Prediabetes,
			is_smoker: false,
			score0: 5,
			score1: 5,
			score2: 5,
			score3: 5
		},
		Survey {
			bmi: 25,
			self_reported_chronic: None,
			is_smoker: false,
			score0: 2,
			score1: 3,
			score2: 3,
			score3: 2
		},

		Survey {
			bmi: 25,
			self_reported_chronic: None,
			is_smoker: false,
			score0: 0,
			score1: 0,
			score2: 5,
			score3: 5
		}
	];

	for i in 0..surveys.len() {
		println!("{} ", surveys[i]);
	};
	}
