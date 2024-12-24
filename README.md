# Codeforces Recent Problem List

This is a simple webpage to help you manage Codeforces problems. It organizes problems into three categories: **Solved**, **Unsolved**, and **Hold**.

### What You Can Do:
- **See Your Progress**: Solved problems are automatically marked and cannot be changed.
- **Move Problems to Hold**: If you want to focus on specific unsolved problems later, you can move them to the Hold section by checking a box.
- **Filter and Search**: Filter problems by contest type or problem number. You can also search for problems by name or contest.
- **Save Your Changes**: The webpage saves your changes locally, so your data won’t be lost even if you refresh the page.
- **Reset Data**: If you want to start fresh, just enter your Codeforces ID and press the "Find" button.


---

### How It Works:
1. Enter your Codeforces ID.
2. Browse the list of problems fetched from recent contests.
3. Use filters or search to find specific problems.
4. Move unsolved problems to the Hold section if needed.
5. Changes are saved automatically.

---

### Example Views:

#### Hold Problems
View unsolved problems and move them to Hold if needed.

![Unsolved Problems](https://github.com/user-attachments/assets/15044f4c-2c60-4759-8dd5-5e9b7e5b5bb3)

#### Hold Problems
View hold problems and move them to unsolved if needed.

![Hold Problems](https://github.com/user-attachments/assets/1aeae988-c5cc-41b3-ab60-259aebb9c888)

#### Solved Problems
View problems you’ve already solved. This list updates when you fetch new data.

![Solved Problems](https://github.com/user-attachments/assets/91efe0e9-69b6-41b5-b2b1-d666c74018d2)

---

### Installation and Usage

1. **Clone or Download the Project**  
   Clone the repository or download the project files to your local machine.

2. **Install Required Libraries**  
   The project uses `md5.min.js` to hash sensitive data such as your Codeforces ID. To include this library:
   - Download the file `md5.min.js` from a reliable source like [cdnjs](https://cdnjs.com/).
   - Place it inside the `libs` folder of your project.
   - The file is linked in the HTML using:  
     ```html
     <script src="libs/md5.min.js"></script>
     ```
   - This ensures the hashing function is available for securely handling IDs.
3. **Add Your API Key**
The project uses the Codeforces API for fetching problem data.
- Steps to configure:
  - Get an API key and secret from Codeforces API settings.
  - Add your API key and secret to the relevant section in the project code (e.g., a configuration file or directly in the script).
This ensures secure and personalized access to the API.

3. **Run the Project**  
   - Open the `index.html` file in any modern web browser to load the webpage.
   - Enter your Codeforces ID, apply filters, and start exploring your problem list.
     
# Deployed Link
https://codeforces-recent-problem-list.vercel.app/
