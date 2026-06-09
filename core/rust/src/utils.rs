use std::collections::HashSet;
use std::hash::Hash;

/// String utilities
pub mod str_utils {
    pub fn truncate(s: &str, max_len: usize) -> String {
        if s.len() <= max_len {
            return s.to_string();
        }
        format!("{}...", &s[..max_len.saturating_sub(3)])
    }

    pub fn capitalize(s: &str) -> String {
        let mut c = s.chars();
        match c.next() {
            None => String::new(),
            Some(f) => f.to_uppercase().collect::<String>() + c.as_str().to_lowercase().as_str(),
        }
    }

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

/// Math utilities
pub mod math_utils {
    pub fn clamp<T: PartialOrd>(val: T, min: T, max: T) -> T {
        if val < min { min } else if val > max { max } else { val }
    }

    pub fn lerp(a: f64, b: f64, t: f64) -> f64 {
        a + (b - a) * t
    }

    pub fn random_range(min: i32, max: i32) -> i32 {
        use rand::Rng;
        rand::thread_rng().gen_range(min..=max)
    }
}

/// Collection utilities
pub mod coll_utils {
    use super::*;

    pub fn unique<T: Eq + Hash + Clone>(vec: &[T]) -> Vec<T> {
        let mut set = HashSet::new();
        vec.iter()
            .filter(|&x| set.insert(x))
            .cloned()
            .collect()
    }

    pub fn chunk<T: Clone>(vec: &[T], size: usize) -> Vec<Vec<T>> {
        vec.chunks(size).map(|c| c.to_vec()).collect()
    }
}

/// Error handling utilities
pub mod err_utils {
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
