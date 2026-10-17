import ContentPanel from '../components/Layout/ContentPanel';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <ContentPanel>
      <h1>Для начала работы с приложением выберите один из разделов.</h1>
      <p>
        <Link to="/deadline-calculator">СД | Расчет срока ИМ</Link>
      </p>
      <p>
        <Link to="/currency-converter">СД | Конвертор валют</Link>
      </p>
      <p>
        <Link to="/xml-extractor">ДТ | Извлечь файлы из XML</Link>
      </p>
      <p>
        <Link to="/xml-analyzer">СД | Контроль данных XML</Link>
      </p>
    </ContentPanel>
  );
}

export default Home;
