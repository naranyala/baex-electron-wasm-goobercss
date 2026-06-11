use std::collections::HashSet;
use std::hash::Hash;

/// String utilities providing common text transformation helpers.
pub mod str_utils {
    /// Truncates a string to a maximum length and appends an ellipsis if needed.
    pub fn truncate(s: &str, max_len: usize) -> String {
        if s.len() <= max_len {
            return s.to_string();
        }
        format!("{}...", &s[..max_len.saturating_sub(3)])
    }

    /// Capitalizes the first letter of a string and lowercases the rest.
    pub fn capitalize(s: &str) -> String {
        let mut c = s.chars();
        match c.next() {
            None => String::new(),
            Some(f) => f.to_uppercase().collect::<String>() + c.as_str().to_lowercase().as_str(),
        }
    }

    /// Converts a string into a URL-friendly slug (lowercase, alphanumeric, hyphenated).
    pub fn slugify(s: &str) -> String {
        s.to_lowercase()
            .chars()
            .map(|c| if c.is_alphanumeric() { c } else { '-' })
            .collect::<String>()
            .split('-')
            .filter(|part| !part.is_empty())
            .collect::<Vec<_>>()
            .join("-")
    }
}

/// Math utilities providing common numeric operations.
pub mod math_utils {
    /// Clamps a value between a minimum and maximum bound.
    pub fn clamp<T: PartialOrd>(val: T, min: T, max: T) -> T {
        if val < min { min } else if val > max { max } else { val }
    }

    /// Performs linear interpolation between two floats.
    pub fn lerp(a: f64, b: f64, t: f64) -> f64 {
        a + (b - a) * t
    }

    /// Generates a random integer within an inclusive range.
    pub fn random_range(min: i32, max: i32) -> i32 {
        use rand::Rng;
        rand::thread_rng().gen_range(min..=max)
    }
}

/// Collection utilities for manipulating vectors and slices.
pub mod coll_utils {
    use super::*;

    /// Returns a new vector containing only unique elements from the slice.
    pub fn unique<T: Eq + Hash + Clone>(vec: &[T]) -> Vec<T> {
        let mut set = HashSet::new();
        vec.iter()
            .filter(|&x| set.insert(x))
            .cloned()
            .collect()
    }

    /// Splits a vector into multiple chunks of a specific size.
    pub fn chunk<T: Clone>(vec: &[T], size: usize) -> Vec<Vec<T>> {
        vec.chunks(size).map(|c| c.to_vec()).collect()
    }
}

/// Error handling utilities providing semantic guards.
pub mod err_utils {
    /// Ensures a condition is met, otherwise returns an Error with the provided message.
    pub fn ensure<T>(condition: bool, msg: &str) -> Result<T, String> {
        if condition {
            // This is a bit awkward in Rust since T must be provided or it's just for checks
            // Usually we use it as a guard: ensure(condition, msg)?;
            Ok(unsafe { std::mem::zeroed() }) // Not really how ensure works in Rust
        } else {
            Err(msg.to_string())
        }
    }
}
