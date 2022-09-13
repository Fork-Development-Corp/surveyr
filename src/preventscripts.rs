use crate::Motivation::*;
use std::fmt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(inspectable)]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum ChronicCondition {
    None,
    Hypertension,
    Diabetes,
    Prediabetes,
    Prehypertension,
}

#[wasm_bindgen(inspectable)]
#[derive(Debug, Clone, Copy)]
pub struct Survey {
    pub bmi: i32,
    pub self_reported_chronic: ChronicCondition,
    pub is_smoker: bool,
    pub score0: u8,
    pub score1: u8,
    pub score2: u8,
    pub score3: u8,
}

pub mod recommendation_engine {
    use crate::recommend;
    use crate::Motivation;
    use crate::Recommendation;
    use crate::Survey;

    use crate::motivation_score;

    pub fn motivation(score0: u8, score1: u8, score2: u8, score3: u8) -> Motivation {
        return motivation_score(score0, score1, score2, score3);
    }
    pub fn recommendation(survey: Survey) -> Recommendation {
        // return survey.get_scores().len();
        return recommend(survey);
        // return Vacay;
    }
}

pub const GREETING: &'static str = "Hallo, Rust library here!";

#[wasm_bindgen]
impl Survey {
    pub fn get_scores(&self) -> Vec<u8> {
        return [self.score0, self.score1, self.score2, self.score3].to_vec();
    }

    pub fn get_bmi(&self) -> i32 {
        return self.bmi;
    }
	
    #[wasm_bindgen(constructor)]
    pub fn new(
        bmi: i32,
        is_smoker: bool,
        chronic_illness: ChronicCondition,
        score0: u8,
        score1: u8,
        score2: u8,
        score3: u8,
    ) -> Survey {
        Survey {
            bmi: bmi,
            is_smoker: is_smoker,
            self_reported_chronic: chronic_illness,
            score0: score0,
            score1: score1,
            score2: score2,
            score3: score3,
        }
    }
}

#[wasm_bindgen(inspectable)]
#[derive(Debug, PartialEq, Eq)]
pub enum Motivation {
    None,
    Zero,
    Low,
    Medium,
    High,
    GungHo,
}

#[wasm_bindgen(inspectable)]
#[derive(Debug, PartialEq, Eq)]
pub enum Recommendation {
    NoneIneligible,
    NoneEmailContact,
    AssessChronicCondition,
    RemoteMonitoring,
    PreventiveCounseling,
    TobaccoCessation,
    SuperNone,
    Vacay
}

impl std::fmt::Display for Recommendation {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		use crate::Recommendation::NoneEmailContact;
		use crate::Recommendation::RemoteMonitoring;
		use crate::Recommendation::PreventiveCounseling;
		use crate::Recommendation::TobaccoCessation;
		use crate::Recommendation::AssessChronicCondition;
		use crate::Recommendation::NoneIneligible;
		use crate::Recommendation::Vacay;
		
        if self == &RemoteMonitoring {
            write!(f, "Remote Monitoring")
        } else if self == &PreventiveCounseling {
            write!(f, "Preventive Counseling")
        } else if self == &TobaccoCessation {
            write!(f, "Tobacco Cessation")
        } else if self == &AssessChronicCondition {
            write!(f, "Assess Chronic Condition ")
        } else if self == &NoneIneligible {
            write!(f, "Ineligible")
        } else if self == &NoneEmailContact {
            write!(f, "Email Contact")
        } else if self == &Vacay {
            write!(f, "Disney, yo.")
        } else {
            write!(f, "None.")	
        }
    }
}

impl std::fmt::Display for Survey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		use crate::recommendation_engine::motivation;
		use crate::recommendation_engine::recommendation;
		
		let scores = self.get_scores();
		let bmi = self.get_bmi();
        write!(f, "BMI {}, {} motivated and we recommended {} ", bmi, motivation(scores[0], scores[1], scores[2], scores[3]), recommendation(*self))
    }
}

impl std::fmt::Display for Motivation {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self == &GungHo {
            write!(f, "Fully")
        } else if self == &Low {
            write!(f, "Low")
        } else if self == &Medium {
            write!(f, "Medium")
        } else {
            write!(f, "Other?")
        }
    }
}
impl std::fmt::Display for ChronicCondition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		use crate::ChronicCondition::Diabetes;
		use crate::ChronicCondition::Hypertension;
		
        if self == &Diabetes {
            write!(f, "Diabetes")
        } else if self == &Hypertension {
            write!(f, "Hypertension")
        } else {
            write!(f, "None")
        }
    }
}

fn needs_chronic_assessment(condition: ChronicCondition) -> bool {
    return (condition == ChronicCondition::Diabetes)
        || (condition == ChronicCondition::Hypertension);
}

#[wasm_bindgen]
pub fn motivation_score(score0: u8, score1: u8, score2: u8, score3: u8) -> Motivation {
    use crate::Motivation::{GungHo, Low, Medium};

    let mut perfect_score_count = 0;
    let mut imperfect_score_count = 0;
    let max_score: u8 = 5;
    let max_imperfect_score: u8 = 4;
    let score_count = 4;

    let scores = [score0, score1, score2, score3];
    for score in scores {
        if score == max_score {
            perfect_score_count = perfect_score_count + 1;
        }

        if score < max_imperfect_score {
            imperfect_score_count = imperfect_score_count + 1;
        }
    }

    if perfect_score_count == score_count {
        return GungHo;
    }

    if imperfect_score_count >= 3 {
        return Low;
    }

    return Medium;
}

#[wasm_bindgen]
pub fn recommend(survey: Survey) -> Recommendation {
    use crate::Motivation::{GungHo, Low};
    use crate::Recommendation::*;

    // if the patient reports something, it needs assessment.
    if needs_chronic_assessment(survey.self_reported_chronic) {
        return AssessChronicCondition;
    }

    // at this point, no / pre-disease
    // time for BMI check
    if survey.bmi <= 24 {
        // go be healthy elsewhere.
        return NoneIneligible;
    }

    // ok eligible via BMI.  how motivated?
    // let vector_of_survey_scores = [
    // 	survey.score0,
    // 	survey.score1,
    // 	survey.score2,
    // 	survey.score3
    // ].to_vec();

    let motivation = motivation_score(survey.score0, survey.score1, survey.score2, survey.score3);

    if motivation == Low {
        // go get motivated.
        return NoneEmailContact;
    }

    if motivation == GungHo {
        // time to get healthy.
        if survey.bmi >= 30 {
            return PreventiveCounseling;
        }

        // highly motivated, smoker
        if survey.is_smoker {
            return TobaccoCessation;
        }

        // highly motivated, nonsmoker, BMI < 30
        return RemoteMonitoring;
    }

    // mixed motivation at this point
    return RemoteMonitoring;
}
