#include <vector>
#include <algorithm>

template<typename T>
void insertion_sort(std::vector<T>& vector) {
    if (vector.size() <= 1) {
        return;
    }
    
    for (size_t iteration = 1; iteration < vector.size(); iteration++) {
        for (size_t index = iteration; index >= 1; index--) {
            if (vector[index - 1] < vector[index]) {
                std::swap(vector[index - 1], vector[index]);
            } else {
                break;
            }
        }
    }
}